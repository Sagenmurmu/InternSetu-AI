"""Script to generate realistic synthetic candidates data for ML experiments."""

import csv
import os
import random

# Set seed for reproducibility
random.seed(42)

# Lists for random sampling
FIRST_NAMES = [
    "Rahul", "Priya", "Amit", "Neha", "Arjun", "Anjali", "Siddharth", "Pooja",
    "Vikram", "Sneha", "Aditya", "Divya", "Rajesh", "Kiran", "Sanjay", "Ritu",
    "Manish", "Sunita", "Deepak", "Asha", "Rohan", "Meera", "Vijay", "Jyoti",
    "Abhishek", "Komal", "Suresh", "Preeti", "Alok", "Shweta", "Yash", "Tanvi"
]

LAST_NAMES = [
    "Sharma", "Kumar", "Singh", "Verma", "Gupta", "Jha", "Patel", "Mehta",
    "Reddy", "Nair", "Das", "Sen", "Joshi", "Rao", "Mishra", "Pandey",
    "Choudhury", "Bose", "Dubey", "Yadav", "Tiwari", "Prasad", "Sinha"
]

GENDERS = ["Male", "Female", "Other"]
CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"]
RURAL_URBAN = ["Rural", "Urban"]

LOCATIONS = [
    {"state": "Jharkhand", "districts": ["Ranchi", "Gumla", "Khunti", "Simdega", "Latehar", "Dhanbad", "Bokaro"]},
    {"state": "Karnataka", "districts": ["Bengaluru Rural", "Bengaluru Urban", "Mysuru", "Kolar", "Hubli"]},
    {"state": "Maharashtra", "districts": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"]},
    {"state": "Bihar", "districts": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"]},
    {"state": "Haryana", "districts": ["Nuh", "Gurugram", "Faridabad", "Panipat"]}
]

QUALIFICATIONS = [
    "10th Pass", "12th Pass", "ITI", "Diploma", "B.Tech / B.E.",
    "B.Sc", "B.Com", "BBA / BMS", "M.Tech / M.E.", "MBA", "M.Sc", "PhD"
]

SECTORS = [
    "IT / Software", "Manufacturing", "Finance / Banking", "Healthcare",
    "Education", "Retail / E-commerce", "Government", "Media / Entertainment",
    "Agriculture", "Logistics / Supply Chain"
]

SKILL_POOL = [
    "Python", "JavaScript", "React", "FastAPI", "SQL", "Excel", "Data Analysis",
    "Machine Learning", "Communication", "Java", "C++", "HTML/CSS", "Node.js",
    "MongoDB", "Tableau", "Power BI", "AWS", "Docker", "Git", "Figma"
]


def generate_candidates(count=500):
    candidates = []
    
    for i in range(1, count + 1):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        name = f"{first} {last}"
        
        # Gender distribution (approx. 50% Male, 45% Female, 5% Other)
        gender = random.choices(GENDERS, weights=[50, 45, 5], k=1)[0]
        
        # Category distribution
        category = random.choices(CATEGORIES, weights=[40, 35, 12, 8, 5], k=1)[0]
        
        # Rural vs Urban
        rural_or_urban = random.choices(RURAL_URBAN, weights=[60, 40], k=1)[0]
        
        # Location
        loc = random.choice(LOCATIONS)
        state = loc["state"]
        district = random.choice(loc["districts"])
        
        # Qualification (Higher weight for bachelor degrees)
        qualification = random.choices(
            QUALIFICATIONS, 
            weights=[5, 10, 5, 15, 30, 10, 8, 7, 3, 4, 2, 1], 
            k=1
        )[0]
        
        # Skills (random subset of 2-5 skills)
        num_skills = random.randint(2, 5)
        skills = random.sample(SKILL_POOL, num_skills)
        
        # Sector Interest
        sector_interest = random.choice(SECTORS)
        
        # Location Preference
        location_preference = random.choice([district, "Bengaluru", "Mumbai", "Pune", "Remote"])
        
        # Willing to relocate (80% willing)
        willing_to_relocate = random.choices([True, False], weights=[80, 20], k=1)[0]
        
        # Past participation
        past_participation = random.choices([True, False], weights=[30, 70], k=1)[0]
        
        candidates.append({
            "candidate_id": i,
            "name": name,
            "gender": gender,
            "category": category,
            "rural_or_urban": rural_or_urban,
            "district": district,
            "state": state,
            "qualification": qualification,
            "skills": skills,
            "sector_interest": sector_interest,
            "location_preference": location_preference,
            "willing_to_relocate": willing_to_relocate,
            "past_participation": past_participation
        })
        
    return candidates


if __name__ == "__main__":
    output_dir = "ml-experiments/datasets"
    os.makedirs(output_dir, exist_ok=True)
    
    file_path = os.path.join(output_dir, "candidates_sample.csv")
    candidates_data = generate_candidates(500)
    
    # Write to CSV
    with open(file_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=candidates_data[0].keys())
        writer.writeheader()
        for cand in candidates_data:
            # Format skills list as JSON string
            cand_copy = cand.copy()
            cand_copy["skills"] = str(cand_copy["skills"]).replace("'", '"')
            writer.writerow(cand_copy)
            
    print(f"Generated 500 synthetic candidates in: {file_path}")
