
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Store the database in the backend directory
BASE_DIR = Path(__file__).resolve().parents[1]

DATABASE_PATH = BASE_DIR / "wifisentinel.db"

DATABASE_URL = f"sqlite:///{DATABASE_PATH.as_posix()}"

# Create SQLite engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

# Create database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for database models
Base = declarative_base()


# Database dependency for API routes
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
