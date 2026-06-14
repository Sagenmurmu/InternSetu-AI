"""Evaluation script to measure matching engine performance and coverage offline."""

import csv
import json
import os
import sys

# Add backend to Python path
sys.path.append(os.path.abspath("backend"))

from app.ml.matching_engine import match_candidate_to_internship


class CandidateMock:
    def __init__(self, data):
        self.id = int(data["candidate_id"])
        self.name = data["name"]
        self.gender = data["gender"]
        self.category = data["category"]
        self.rural_or_urban = data["rural_or_urban"]
        self.district = data["district"]
        self.state = data["state"]
        self.qualification = data["qualification"]
        self.skills = json.loads(data["skills"]) if isinstance(data["skills"], str) else data["skills"]
        self.sector_interest = data["sector_interest"]
        self.location_preference = data["location_preference"]
        self.willing_to_relocate = data["willing_to_relocate"] == "True" or data["willing_to_relocate"] == "1"
        self.past_participation = data["past_participation"] == "True" or data["past_participation"] == "1"


class InternshipMock:
    def __init__(self, data):
        self.id = int(data["internship_id"])
        self.company_name = data["company_name"]
        self.title = data["title"]
        self.sector = data["sector"]
        self.required_skills = json.loads(data["required_skills"]) if isinstance(data["required_skills"], str) else data["required_skills"]
        self.required_qualification = data["required_qualification"]
        self.district = data["district"]
        self.state = data["state"]
        self.mode = data["mode"]
        self.capacity = int(data["capacity"])
        self.selected_count = int(data["selected_count"])
        self.is_active = True


def run_evaluation():
    candidates_file = "ml-experiments/datasets/candidates_sample.csv"
    internships_file = "ml-experiments/datasets/internships_sample.csv"
    output_file = "ml-experiments/datasets/match_results_sample.csv"

    if not os.path.exists(candidates_file) or not os.path.exists(internships_file):
        print("Error: Synthetic data CSVs missing. Please run generation scripts first.")
        return

    # Load candidates
    candidates = []
    with open(candidates_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            candidates.append(CandidateMock(row))

    # Load internships
    internships = []
    with open(internships_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            internships.append(InternshipMock(row))

    print(f"Loaded {len(candidates)} candidates and {len(internships)} internships for evaluation.")

    # Match results records list
    match_records = []
    
    # Metrics aggregators
    total_scores = 0.0
    total_skills_scores = 0.0
    valid_pair_count = 0
    
    # Track metrics per candidate
    candidates_with_good_rec = 0
    sector_match_count = 0
    location_match_count = 0
    qualification_match_count = 0
    unique_recommended_internships = set()

    for cand in candidates:
        cand_best_score = 0.0
        
        for job in internships:
            res = match_candidate_to_internship(cand, job)
            if res is None:
                continue
            
            # Aggregate score counters
            total_scores += res["final_score"]
            total_skills_scores += res["skill_score"]
            valid_pair_count += 1
            
            # Check maximum recommendation score for this candidate
            if res["final_score"] > cand_best_score:
                cand_best_score = res["final_score"]
                
            # Check match rates (score threshold-based or binary indicators)
            if res["sector_score"] >= 70.0:
                sector_match_count += 1
            if res["location_score"] >= 70.0:
                location_match_count += 1
            if res["qualification_score"] >= 60.0:
                qualification_match_count += 1
                
            # Save for top-N coverage
            if res["final_score"] >= 60.0:
                unique_recommended_internships.add(job.id)

            match_records.append({
                "candidate_id": cand.id,
                "internship_id": job.id,
                "skill_score": res["skill_score"],
                "qualification_score": res["qualification_score"],
                "location_score": res["location_score"],
                "sector_score": res["sector_score"],
                "fairness_score": res["fairness_score"],
                "final_score": res["final_score"],
                "matched_skills": json.dumps(res["matched_skills"]),
                "missing_skills": json.dumps(res["missing_skills"])
            })
            
        if cand_best_score >= 70.0:
            candidates_with_good_rec += 1

    # Save outputs
    with open(output_file, "w", newline="", encoding="utf-8") as f:
        if match_records:
            writer = csv.DictWriter(f, fieldnames=match_records[0].keys())
            writer.writeheader()
            for row in match_records:
                writer.writerow(row)

    # Compute metric ratios
    avg_final_score = total_scores / valid_pair_count if valid_pair_count > 0 else 0.0
    avg_skills_score = total_skills_scores / valid_pair_count if valid_pair_count > 0 else 0.0
    pct_candidates_satisfied = (candidates_with_good_rec / len(candidates)) * 100.0 if candidates else 0.0
    
    sector_match_rate = (sector_match_count / valid_pair_count) * 100.0 if valid_pair_count > 0 else 0.0
    location_match_rate = (location_match_count / valid_pair_count) * 100.0 if valid_pair_count > 0 else 0.0
    qualification_match_rate = (qualification_match_count / valid_pair_count) * 100.0 if valid_pair_count > 0 else 0.0
    
    recommended_coverage = (len(unique_recommended_internships) / len(internships)) * 100.0 if internships else 0.0

    # Print Summary
    print("\n" + "="*50)
    print("MATCHING ENGINE EVALUATION METRICS REPORT")
    print("="*50)
    print(f"Total Evaluations Computed       : {valid_pair_count}")
    print(f"Average Recommendation Score     : {avg_final_score:.2f}%")
    print(f"Average Skills Match Rating      : {avg_skills_score:.2f}%")
    print(f"Candidates with Match Score >=70 : {pct_candidates_satisfied:.2f}%")
    print(f"Sector Alignment Rate (Score>=70): {sector_match_rate:.2f}%")
    print(f"Location Proximity Rate (>=70)   : {location_match_rate:.2f}%")
    print(f"Qualification Sufficiency (>=60) : {qualification_match_rate:.2f}%")
    print(f"Position Coverage (Score >= 60)  : {recommended_coverage:.2f}%")
    print("="*50)
    print(f"Match results details logged in  : {output_file}\n")


if __name__ == "__main__":
    run_evaluation()
