import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, field_validator


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str


class SignupIn(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_not_blank(cls, v):
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        return v

    @field_validator("password")
    @classmethod
    def password_min_len(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    token: str
    user: UserOut


class DocumentCreateIn(BaseModel):
    title: Optional[str] = "Untitled Document"


class DocumentUpdateIn(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    content: str
    owner_id: str
    owner_username: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    is_owner: bool
    shared_with: List[str] = []


class ShareIn(BaseModel):
    username: str


class ImportFileOut(BaseModel):
    document: DocumentOut
