"""ORM models for users, documents, shares, and auth sessions.

Scope note: sharing is intentionally simple (owner -> grants read/write to
another user by username). No roles/permission levels beyond that.
"""
import datetime
import uuid

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from .database import Base


def gen_id():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_id)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    documents = relationship("Document", back_populates="owner")


class AuthToken(Base):
    """Simple opaque bearer token per login session (not JWT, kept small on purpose)."""
    __tablename__ = "auth_tokens"

    token = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=gen_id)
    title = Column(String, nullable=False, default="Untitled Document")
    # content stored as HTML produced by the Tiptap rich-text editor
    content = Column(Text, nullable=False, default="")
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    owner = relationship("User", back_populates="documents")
    shares = relationship("DocumentShare", back_populates="document", cascade="all, delete-orphan")


class DocumentShare(Base):
    __tablename__ = "document_shares"

    id = Column(String, primary_key=True, default=gen_id)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    shared_with_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    document = relationship("Document", back_populates="shares")
    shared_with = relationship("User")
