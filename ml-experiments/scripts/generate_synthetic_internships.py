"""Script to generate realistic synthetic internships data for ML experiments."""

import csv
import os
import random

# Set seed for reproducibility
random.seed(42)

COMPANIES = [
    "TechNova Solutions", "Tata Consultancy Services", "Wipro", "Infosys",
    "HDFC Bank", "Apollo Hospitals", "Tata Motors", "Reliance Retail",
    "ITC Limited", "Cognizant", "Mahendra & Mahendra", "L&T Engineering",
    "Federal Bank", "Fortis Healthcare", "Flipkart", "Byju's Learning"
]

SECTORS = [
    "IT / Software", "Manufacturing", "Finance / Banking", "Healthcare",
    "Education", "Retail / E-commerce", "Government", "Media / Entertainment",
    "Agriculture", "Logistics / Supply Chain"
]

TITLES = {
    "IT / Software": ["Backend Developer Intern", "Frontend Engineer Intern", "Python developer", "React JS Assistant", "Full Stack Assistant", "Database Administrator Intern"],
    "Manufacturing": ["Mechanical Design Intern", "Production line trainee", "CAD Draftsman", "Quality Assurance Assistant"],
    "Finance / Banking": ["Finance Analyst Intern", "Accounting Trainee", "Credit Risk Assistant", "Investment Analyst Trainee"],
    "Healthcare": ["Nursing Assistant", "Clinical Lab Intern", "Healthcare Operations Intern", "Pharmacy Trainee"],
    "Education": ["Content Writer Intern", "Online Tutor Trainee", "Academic Coordinator Assistant", "Training Coordinator"],
    "Retail / E-commerce": ["Digital Marketing Intern", "E-commerce Operations Assistant", "Sales Trainee", "Customer Relations Intern"],
    "Government": ["Public Policy Trainee", "Administrative Analyst Assistant", "Municipal Planning Intern", "Audit Trainee"],
    "Media / Entertainment": ["Video Editor Intern", "Graphic Design Trainee", "Content Writer", "Social Media Coordinator Assistant"],
    "Agriculture": ["Agronomy Trainee", "Soil testing lab intern", "Agro-forestry Trainee", "Farm Management Trainee"],
    "Logistics / Supply Chain": ["Logistics Analyst Intern", "Warehouse Supervisor Trainee", "Supply Chain Coordinator Assistant", "Inventory Management Trainee"]
}

SKILLS_BY_SECTOR = {
    "IT / Software": ["Python", "JavaScript", "React", "FastAPI", "SQL", "HTML/CSS", "Node.js", "MongoDB", "Git", "Docker", "AWS"],
    "Manufacturing": ["Excel", "Data Analysis", "Communication", "CAD Drawing", "Quality Control"],
    "Finance / Banking": ["Excel", "Data Analysis", "SQL", "Tableau", "Power BI", "Financial Modeling"],
    "Healthcare": ["Communication", "First Aid", "Patient Care", "Record Keeping"],
    "Education": ["Communication", "Content Writing", "Teaching", "PowerPoint"],
    "Retail / E-commerce": ["Excel", "Communication", "Figma", "SEO", "Sales Pitching"],
    "Government": ["Excel", "Communication", "Report Writing", "Audit Checks"],
    "Media / Entertainment": ["Figma", "Video Editing", "Photoshop", "Content Writing", "Communication"],
    "Agriculture": ["Excel", "Data Analysis", "Research Methods", "Soil Testing"],
    "Logistics / Supply Chain": ["Excel", "Data Analysis", "SQL", "Inventory Management", "Logistics Planning"]
}

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

MODES = ["Remote", "On-site", "Hybrid"]


def generate_internships(count=100):
    internships = []
    
    for i in range(1, count + 1):
        company = random.choice(COMPANIES)
        sector = random.choice(SECTORS)
        title = random.choice(TITLES[sector])
        
        # Location
        loc = random.choice(LOCATIONS)
        state = loc["state"]
        district = random.choice(loc["districts"])
        
        # Qualification requirements (weights adjusted appropriately)
        required_qualification = random.choices(
            QUALIFICATIONS,
            weights=[2, 5, 8, 25, 25, 10, 8, 7, 4, 3, 2, 1],
            k=1
        )[0]
        
        # Skills
        sector_skills = SKILLS_BY_SECTOR[sector]
        num_skills = random.randint(1, 4)
        num_skills = min(num_skills, len(sector_skills))
        required_skills = random.sample(sector_skills, num_skills)
        
        # Mode
        mode = random.choices(MODES, weights=[40, 40, 20], k=1)[0]
        
        # Capacity (1 to 5 seats)
        capacity = random.randint(1, 5)
        
        # Selected count (mostly vacant, some occupied, some full to verify capacity limits)
        selected_count = random.choices(
            [0, random.randint(1, max(1, capacity - 1)), capacity],
            weights=[70, 20, 10],
            k=1
        )[0]
        # Keep within bounds
        selected_count = min(selected_count, capacity)
        
        internships.append({
            "internship_id": i,
            "company_name": company,
            "title": title,
            "sector": sector,
            "required_skills": required_skills,
            "required_qualification": required_qualification,
            "district": district,
            "state": state,
            "mode": mode,
            "capacity": capacity,
            "selected_count": selected_count
        })
        
    return internships


if __name__ == "__main__":
    output_dir = "ml-experiments/datasets"
    os.makedirs(output_dir, exist_ok=True)
    
    file_path = os.path.join(output_dir, "internships_sample.csv")
    internships_data = generate_internships(100)
    
    # Write to CSV
    with open(file_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=internships_data[0].keys())
        writer.writeheader()
        for job in internships_data:
            job_copy = job.copy()
            job_copy["required_skills"] = str(job_copy["required_skills"]).replace("'", '"')
            writer.writerow(job_copy)
            
    print(f"Generated 100 synthetic internships in: {file_path}")
