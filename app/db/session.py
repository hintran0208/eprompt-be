# app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Configure engine parameters based on database type
engine_kwargs = {}
if settings.DATABASE_URL.startswith("postgresql"):
    engine_kwargs["pool_pre_ping"] = True
elif settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
