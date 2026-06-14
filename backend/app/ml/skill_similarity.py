"""Semantic skill similarity calculations using TF-IDF and exact synonym matching."""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.core.constants import SKILLS
from app.ml.skill_normalizer import normalize_skills


def calculate_skill_score(candidate_skills, required_skills) -> dict:
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
