from fastapi import APIRouter, Depends
from datetime import datetime
from typing import Dict, Any
import psutil
import sys

router = APIRouter()

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint to verify the API is running
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Intervue API",
        "version": "1.0.0"
    }

@router.get("/health/detailed")
async def detailed_health_check() -> Dict[str, Any]:
    """
    Detailed health check with system information
    """
    memory = psutil.virtual_memory()
    cpu_percent = psutil.cpu_percent()
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Intervue API",
        "version": "1.0.0",
        "system": {
            "python_version": sys.version,
            "cpu_usage_percent": cpu_percent,
            "memory_usage_percent": memory.percent,
            "memory_available_mb": memory.available / (1024 * 1024),
            "disk_usage": {
                "total_gb": psutil.disk_usage('/').total / (1024**3),
                "used_gb": psutil.disk_usage('/').used / (1024**3),
                "free_gb": psutil.disk_usage('/').free / (1024**3)
            }
        }
    }

@router.get("/test/cors")
async def test_cors() -> Dict[str, Any]:
    """
    Test endpoint to verify CORS configuration with React frontend
    """
    return {
        "message": "CORS is working! You can successfully call this endpoint from your React app.",
        "timestamp": datetime.now().isoformat(),
        "frontend_url": "http://localhost:5173",
        "backend_url": "http://localhost:8000",
        "cors_enabled": True
    }