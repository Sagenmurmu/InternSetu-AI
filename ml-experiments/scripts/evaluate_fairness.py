"""Script to measure fairness and representation metrics for the allocation system."""

import csv
import json
import os
import pandas as pd

# Cautionary system statement
CAUTIONARY_STATEMENT = "This report helps monitor representation and identify possible allocation imbalance."


def run_fairness_evaluation():
    candidates_file = "ml-experiments/datasets/candidates_sample.csv"
    matches_file = "ml-experiments/datasets/match_results_sample.csv"
    output_report = "ml-experiments/datasets/fairness_report.csv"

    if not os.path.exists(candidates_file) or not os.path.exists(matches_file):
        print("Error: Input files missing. Please run generation and matching evaluations first.")
        return

    # Load into Pandas DataFrames
    df_cand = pd.read_csv(candidates_file)
    df_matches = pd.read_csv(matches_file)

    # Merge on candidate_id
    df_merged = pd.merge(df_matches, df_cand, on="candidate_id")

    print(f"Analyzing {len(df_merged)} recommendation matches across {len(df_cand)} candidates...")

    report_rows = []

    # 1. Rural vs Urban Split
    rural_mask = df_merged["rural_or_urban"] == "Rural"
    urban_mask = df_merged["rural_or_urban"] == "Urban"
    
    avg_rural_score = df_merged[rural_mask]["final_score"].mean() if rural_mask.any() else 0.0
    avg_urban_score = df_merged[urban_mask]["final_score"].mean() if urban_mask.any() else 0.0
    
    report_rows.append({"Dimension": "Rural/Urban", "Group": "Rural", "Average_Match_Score": round(avg_rural_score, 2)})
    report_rows.append({"Dimension": "Rural/Urban", "Group": "Urban", "Average_Match_Score": round(avg_urban_score, 2)})

    # 2. Category Breakdown
    categories = df_merged["category"].unique()
    for cat in categories:
        cat_mask = df_merged["category"] == cat
        avg_score = df_merged[cat_mask]["final_score"].mean() if cat_mask.any() else 0.0
        report_rows.append({"Dimension": "Category", "Group": cat, "Average_Match_Score": round(avg_score, 2)})

    # 3. Gender Breakdown
    genders = df_merged["gender"].unique()
    for g in genders:
        g_mask = df_merged["gender"] == g
        avg_score = df_merged[g_mask]["final_score"].mean() if g_mask.any() else 0.0
        report_rows.append({"Dimension": "Gender", "Group": g, "Average_Match_Score": round(avg_score, 2)})

    # 4. District and state coverage
    total_districts = df_cand["district"].nunique()
    covered_districts = df_merged[df_merged["final_score"] >= 60.0]["district"].nunique()
    
    # 5. Rural candidates match satisfaction (Score >= 70)
    # Find best score per candidate
    best_scores = df_merged.groupby("candidate_id").agg({
        "final_score": "max",
        "rural_or_urban": "first",
        "category": "first"
    })
    
    rural_satisfied = (best_scores[(best_scores["rural_or_urban"] == "Rural")]["final_score"] >= 70.0).mean() * 100.0
    urban_satisfied = (best_scores[(best_scores["rural_or_urban"] == "Urban")]["final_score"] >= 70.0).mean() * 100.0

    # Write report rows to CSV
    pd.DataFrame(report_rows).to_csv(output_report, index=False)

    # Print Summary Report
    print("\n" + "="*50)
    print("FAIRNESS & REPRESENTATION METRICS REPORT")
    print("="*50)
    print(f"Caution Notice                   : {CAUTIONARY_STATEMENT}")
    print("-"*50)
    print(f"Rural Candidates Avg Match Score : {avg_rural_score:.2f}%")
    print(f"Urban Candidates Avg Match Score : {avg_urban_score:.2f}%")
    print(f"Rural Candidate Match Sat (>=70) : {rural_satisfied:.2f}%")
    print(f"Urban Candidate Match Sat (>=70) : {urban_satisfied:.2f}%")
    print("-"*50)
    print("Category Match Score Averages:")
    category_df = pd.DataFrame(report_rows)
    cat_only = category_df[category_df["Dimension"] == "Category"]
    for _, row in cat_only.iterrows():
        print(f"  - {row['Group']:<15}: {row['Average_Match_Score']}%")
    print("-"*50)
    print("Gender Match Score Averages:")
    gender_only = category_df[category_df["Dimension"] == "Gender"]
    for _, row in gender_only.iterrows():
        print(f"  - {row['Group']:<15}: {row['Average_Match_Score']}%")
    print("-"*50)
    print(f"District Geographic Coverage     : {covered_districts}/{total_districts} districts")
    print("="*50)
    print(f"Fairness report logged in        : {output_report}\n")


if __name__ == "__main__":
    run_fairness_evaluation()
