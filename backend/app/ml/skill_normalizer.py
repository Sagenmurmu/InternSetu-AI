"""Utility for cleaning, normalizing, and resolving skill variations."""

import json
from app.ml.model_config import SKILL_SYNONYMS


def normalize_skill(skill: str) -> str:
    """Clean and normalize a single skill string, applying synonym mapping."""
    if not skill:
        return ""
    
    # Clean string: lowercase and strip spaces
    cleaned = skill.lower().strip()
    
    # Resolve variations (e.g. remove common trailing/leading symbols/formatting)
    cleaned = cleaned.replace("-", "").replace("_", "").replace("  ", " ")
    
    # Lookup in synonym map
    return SKILL_SYNONYMS.get(cleaned, cleaned)


def normalize_skills(skills: list[str] | str) -> list[str]:
    """Parse and normalize a list or string of skills, returning a sorted unique list."""
    if not skills:
        return []
    
    parsed_skills = []
    
    # Handle list input
    if isinstance(skills, list):
        parsed_skills = skills
    
    # Handle string inputs
    elif isinstance(skills, str):
        trimmed = skills.strip()
        # Handle JSON array representation
        if trimmed.startswith("[") and trimmed.endswith("]"):
            try:
                parsed_skills = json.loads(trimmed)
            except (json.JSONDecodeError, TypeError):
                # Fallback to comma splitting
                parsed_skills = trimmed[1:-1].split(",")
        else:
            # Handle comma separated string
            parsed_skills = [s.strip() for s in trimmed.split(",") if s.strip()]
            
    # Fallback/Safe parsing
    else:
        try:
            parsed_skills = list(skills)
        except Exception:
            return []

    # Clean and map all entries
    normalized = []
    for s in parsed_skills:
        if isinstance(s, str):
            val = normalize_skill(s)
            if val and val not in normalized:
                normalized.append(val)
        elif s:
            val = normalize_skill(str(s))
            if val and val not in normalized:
                normalized.append(val)
                
    return sorted(normalized)
