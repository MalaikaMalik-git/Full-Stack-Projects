from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db
from ..file_import import text_or_markdown_to_html

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_IMPORT_EXTENSIONS = {".txt", ".md"}
MAX_IMPORT_SIZE_BYTES = 2 * 1024 * 1024  # 2MB — generous for plain text/markdown


def _to_document_out(doc: models.Document, current_user: models.User) -> schemas.DocumentOut:
    shared_usernames = [s.shared_with.username for s in doc.shares]
    return schemas.DocumentOut(
        id=doc.id,
        title=doc.title,
        content=doc.content,
        owner_id=doc.owner_id,
        owner_username=doc.owner.username,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        is_owner=(doc.owner_id == current_user.id),
        shared_with=shared_usernames,
    )


def _get_accessible_document(doc_id: str, current_user: models.User, db: Session) -> models.Document:
    """Fetch a document only if the current user owns it or it's been shared with them."""
    doc = db.query(models.Document).filter_by(id=doc_id).first()
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    is_owner = doc.owner_id == current_user.id
    is_shared_with_me = any(s.shared_with_user_id == current_user.id for s in doc.shares)
    if not (is_owner or is_shared_with_me):
        raise HTTPException(status_code=403, detail="You don't have access to this document")
    return doc


@router.get("", response_model=list[schemas.DocumentOut])
def list_documents(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    owned = db.query(models.Document).filter_by(owner_id=current_user.id).all()
    shared_links = db.query(models.DocumentShare).filter_by(shared_with_user_id=current_user.id).all()
    shared_docs = [link.document for link in shared_links]
    all_docs = owned + shared_docs
    all_docs.sort(key=lambda d: d.updated_at, reverse=True)
    return [_to_document_out(d, current_user) for d in all_docs]


@router.post("", response_model=schemas.DocumentOut, status_code=201)
def create_document(
    payload: schemas.DocumentCreateIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc = models.Document(title=payload.title or "Untitled Document", content="", owner_id=current_user.id)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return _to_document_out(doc, current_user)


@router.get("/{doc_id}", response_model=schemas.DocumentOut)
def get_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc = _get_accessible_document(doc_id, current_user, db)
    return _to_document_out(doc, current_user)


@router.put("/{doc_id}", response_model=schemas.DocumentOut)
def update_document(
    doc_id: str,
    payload: schemas.DocumentUpdateIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc = _get_accessible_document(doc_id, current_user, db)
    if payload.title is not None:
        title = payload.title.strip()
        if not title:
            raise HTTPException(status_code=422, detail="Title cannot be empty")
        doc.title = title
    if payload.content is not None:
        doc.content = payload.content
    db.commit()
    db.refresh(doc)
    return _to_document_out(doc, current_user)


@router.delete("/{doc_id}", status_code=204)
def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc = db.query(models.Document).filter_by(id=doc_id).first()
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can delete this document")
    db.delete(doc)
    db.commit()
    return None


@router.post("/import", response_model=schemas.DocumentOut, status_code=201)
async def import_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    filename = file.filename or ""
    ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""

    if ext not in ALLOWED_IMPORT_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ext or 'unknown'}'. Only .txt and .md files are supported.",
        )

    raw_bytes = await file.read()
    if len(raw_bytes) > MAX_IMPORT_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File is too large. Max size is 2MB.")

    try:
        raw_text = raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=422, detail="File must be UTF-8 encoded plain text or Markdown.")

    content_html = text_or_markdown_to_html(raw_text)
    title = filename.rsplit(".", 1)[0][:200] or "Imported Document"

    doc = models.Document(title=title, content=content_html, owner_id=current_user.id)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return _to_document_out(doc, current_user)


@router.post("/{doc_id}/share", response_model=schemas.DocumentOut)
def share_document(
    doc_id: str,
    payload: schemas.ShareIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc = db.query(models.Document).filter_by(id=doc_id).first()
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can share this document")

    target_username = payload.username.strip()
    if target_username == current_user.username:
        raise HTTPException(status_code=400, detail="You already own this document")

    target_user = db.query(models.User).filter_by(username=target_username).first()
    if target_user is None:
        raise HTTPException(status_code=404, detail=f"No user found with username '{target_username}'")

    already_shared = db.query(models.DocumentShare).filter_by(
        document_id=doc.id, shared_with_user_id=target_user.id
    ).first()
    if already_shared:
        raise HTTPException(status_code=400, detail=f"Already shared with {target_username}")

    share = models.DocumentShare(document_id=doc.id, shared_with_user_id=target_user.id)
    db.add(share)
    db.commit()
    db.refresh(doc)
    return _to_document_out(doc, current_user)


@router.delete("/{doc_id}/share/{username}", response_model=schemas.DocumentOut)
def unshare_document(
    doc_id: str,
    username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc = db.query(models.Document).filter_by(id=doc_id).first()
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can modify sharing")

    target_user = db.query(models.User).filter_by(username=username).first()
    if target_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    share = db.query(models.DocumentShare).filter_by(
        document_id=doc.id, shared_with_user_id=target_user.id
    ).first()
    if share is None:
        raise HTTPException(status_code=404, detail="This document isn't shared with that user")

    db.delete(share)
    db.commit()
    db.refresh(doc)
    return _to_document_out(doc, current_user)
