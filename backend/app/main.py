
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from sqlalchemy import text

from .database import Base, engine, get_db
from . import models
from .scanner import scan_wifi_networks


# Create database tables
Base.metadata.create_all(bind=engine)


# Initialize FastAPI
app = FastAPI(
    title="WiFi Sentinel API",
    description="Wi-Fi Network Security Analysis Platform",
    version="1.0.0"
)


# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Welcome to WiFi Sentinel API",
        "status": "running"
    }


@app.get("/api/health")
def health_check():
    return {
        "application": "WiFi Sentinel",
        "status": "healthy",
        "version": "1.0.0"
    }


@app.get("/api/db-check")
def database_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))

        table_count = db.query(models.ScanSession).count()

        return {
            "database": "SQLite",
            "status": "connected",
            "table": "scan_sessions",
            "existing_records": table_count
        }

    except Exception as error:
        return {
            "database": "SQLite",
            "status": "error",
            "message": str(error)
        }


# Wi-Fi Scanning API
@app.get("/api/scan")
def scan_networks():

    try:

        networks = scan_wifi_networks()

        return {
            "status": "success",
            "total_networks": len(networks),
            "networks": networks
        }

    except RuntimeError as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
