"""Seeds a few demo users so reviewers can test sharing without signing up.

Credentials (documented in README too):
  alice / password123
  bob   / password123
  carol / password123
"""
from sqlalchemy.orm import Session
from . import models
from .auth import hash_password

SEED_USERS = [
    ("alice", "password123"),
    ("bob", "password123"),
    ("carol", "password123"),
]


def seed_users(db: Session):
    for username, password in SEED_USERS:
        existing = db.query(models.User).filter_by(username=username).first()
        if not existing:
            db.add(models.User(username=username, password_hash=hash_password(password)))
    db.commit()
