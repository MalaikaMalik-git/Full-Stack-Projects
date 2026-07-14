import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import hash_password, verify_password, get_current_user
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.TokenOut, status_code=201)
def signup(payload: schemas.SignupIn, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter_by(username=payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")

    user = models.User(username=payload.username, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = models.AuthToken(token=uuid.uuid4().hex, user_id=user.id)
    db.add(token)
    db.commit()

    return schemas.TokenOut(token=token.token, user=schemas.UserOut.model_validate(user))


@router.post("/login", response_model=schemas.TokenOut)
def login(payload: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = models.AuthToken(token=uuid.uuid4().hex, user_id=user.id)
    db.add(token)
    db.commit()

    return schemas.TokenOut(token=token.token, user=schemas.UserOut.model_validate(user))


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return schemas.UserOut.model_validate(current_user)


@router.get("/users", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Used by the frontend's share dialog to let users pick a recipient by username."""
    users = db.query(models.User).filter(models.User.id != current_user.id).all()
    return [schemas.UserOut.model_validate(u) for u in users]
