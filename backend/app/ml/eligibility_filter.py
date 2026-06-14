"""Eligibility filter for verifying candidate and internship constraints (e.g. active, capacity)."""


def is_eligible(candidate, internship) -> bool:
    """
    Check if a candidate can be recommended/allocated to an internship.
    Checks active status and capacity vacancy details.
    """
    if not internship:
        return False
        
    # Check if internship is active
    if not getattr(internship, "is_active", True):
        return False
        
    # Enforce capacity constraints: cannot match if slots are full
    capacity = getattr(internship, "capacity", 1) or 1
    selected_count = getattr(internship, "selected_count", 0) or 0
    
    if selected_count >= capacity:
        return False
        
    return True
