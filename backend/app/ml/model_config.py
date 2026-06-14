"""Configuration parameters, synonyms, and weights for the ML matching engine."""

# Weights for matching scoring factors (must sum to 1.0)
SKILL_WEIGHT = 0.35
QUALIFICATION_WEIGHT = 0.20
LOCATION_WEIGHT = 0.15
SECTOR_WEIGHT = 0.15
FAIRNESS_WEIGHT = 0.15

# Core synonyms for skill normalization
SKILL_SYNONYMS = {
    "js": "javascript",
    "reactjs": "react",
    "react.js": "react",
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "data analytics": "data analysis",
    "ms excel": "excel",
    "fast api": "fastapi",
    "sql database": "sql",
    "python programming": "python",
}

# Groupings for identifying related/transferable sectors
SECTOR_GROUPS = [
    {"it / software", "data analytics", "ai/ml"},
    {"finance / banking", "accounting", "banking", "finance"},
    {"manufacturing", "operations", "logistics / supply chain", "logistics"},
    {"healthcare", "public health"},
    {"agriculture", "rural development"},
    {"education", "training"},
]

# Numeric ranking levels for educational qualification checks
QUALIFICATION_HIERARCHY = {
    "10th pass": 1,
    "10th": 1,
    "12th pass": 2,
    "12th": 2,
    "iti": 3,
    "diploma": 4,
    "bca": 5,
    "b.sc": 5,
    "bsc": 5,
    "ba": 5,
    "b.com": 5,
    "bcom": 5,
    "bba": 5,
    "bms": 5,
    "b.tech": 6,
    "b.e.": 6,
    "btech": 6,
    "be": 6,
    "mca": 7,
    "mba": 7,
    "m.tech": 7,
    "mtech": 7,
    "m.e.": 7,
    "me": 7,
    "m.sc": 7,
    "msc": 7,
    "phd": 8,
}

# Aspirational districts in India for diversity considerations
ASPIRATIONAL_DISTRICTS = {
    "ranchi", "gumla", "khunti", "simdega", "latehar", "hazaribagh",
    "barani", "narmada", "nuh", "aspirational"
}
