#!/usr/bin/env python3
"""
Simple script to run the FastAPI application.
Usage: python run.py
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
        reload_dirs=["app"]
    )
