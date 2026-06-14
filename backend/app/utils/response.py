"""Common response helpers for consistent API output."""

from typing import Any, Optional


def success_response(data: Any = None, message: str = "Success") -> dict:
    """Return a standardized success response."""
    return {
        "success": True,
        "message": message,
        "data": data,
    }


def error_response(message: str, error: Optional[str] = None) -> dict:
    """Return a standardized error response."""
    return {
        "success": False,
        "message": message,
        "error": error or "ERROR",
    }
