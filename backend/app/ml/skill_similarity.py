"""Semantic skill similarity calculations using TF-IDF and exact synonym matching."""

import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.core.constants import SKILLS
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


def normalize_skills(skills) -> list[str]:
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


def calculate_skill_similarity(candidate_skills, required_skills) -> dict:
    """
    Calculate candidate skills match rating against required skills.
    Combines exact/synonym overlap ratio (75%) and TF-IDF cosine similarity (25%).
    """
    # Normalize inputs
    cand_norm = normalize_skills(candidate_skills)
    req_norm = normalize_skills(required_skills)
    
    # Safe checks for empty inputs
    if not req_norm:
        return {
            "score": 0.0,
            "matched_skills": [],
            "missing_skills": [],
            "similarity_score": 0.0,
            "exact_overlap_score": 0.0
        }
        
    if not cand_norm:
        return {
            "score": 0.0,
            "matched_skills": [],
            "missing_skills": req_norm,
            "similarity_score": 0.0,
            "exact_overlap_score": 0.0
        }

    # 1. Exact and synonym overlap
    matched_set = set(cand_norm) & set(req_norm)
    matched_skills = sorted(list(matched_set))
    missing_skills = sorted(list(set(req_norm) - matched_set))
    
    exact_overlap_score = (len(matched_skills) / len(req_norm)) * 100.0

    # 2. Semantic TF-IDF Similarity
    # Build vocabulary baseline using the application's pre-defined skills
    base_skills = [s.lower() for s in SKILLS]
    
    # Create document strings
    cand_doc = " ".join(cand_norm)
    req_doc = " ".join(req_norm)
    
    # Vocabulary representation
    corpus = base_skills + [cand_doc, req_doc]
    
    try:
        vectorizer = TfidfVectorizer().fit(corpus)
        cand_vec = vectorizer.transform([cand_doc])
        req_vec = vectorizer.transform([req_doc])
        
        sim_val = cosine_similarity(cand_vec, req_vec)[0][0]
        similarity_score = float(sim_val) * 100.0
        if np.isnan(similarity_score):
            similarity_score = 0.0
    except Exception:
        similarity_score = 0.0

    # 3. Combine scores
    final_score = (0.75 * exact_overlap_score) + (0.25 * similarity_score)
    final_score = round(min(max(final_score, 0.0), 100.0), 2)
    
    return {
        "score": final_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "similarity_score": round(similarity_score, 2),
        "exact_overlap_score": round(exact_overlap_score, 2)
    }
