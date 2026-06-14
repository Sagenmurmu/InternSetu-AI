import re
from typing import List
from io import BytesIO
import fitz  # PyMuPDF
import docx  # python-docx

from app.core.constants import SKILLS, QUALIFICATIONS


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text from PDF bytes using PyMuPDF."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract raw text from DOCX bytes using python-docx."""
    doc = docx.Document(BytesIO(file_bytes))
    text = ""
    for p in doc.paragraphs:
        text += p.text + "\n"
    return text


def extract_email(text: str) -> str:
    """Extract first matched email address from text using regex."""
    pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    match = re.search(pattern, text)
    return match.group(0) if match else ""


def extract_phone(text: str) -> str:
    """Extract first matched phone number from text using regex."""
    pattern = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    match = re.search(pattern, text)
    return match.group(0) if match else ""


def extract_skills(text: str) -> List[str]:
    """Search for skills listed in platform SKILLS baseline within the parsed text."""
    found_skills = []
    text_lower = text.lower()
    for skill in SKILLS:
        # Check standard word boundaries to prevent substring overlaps
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if "++" in skill or "/" in skill or "#" in skill:
            if skill.lower() in text_lower:
                found_skills.append(skill)
        elif re.search(pattern, text_lower):
            found_skills.append(skill)
    return found_skills


def extract_education(text: str) -> str:
    """Find qualifications matching items in QUALIFICATIONS constants."""
    text_lower = text.lower()
    for qual in reversed(QUALIFICATIONS):
        if "/" in qual:
            parts = [p.strip().lower() for p in qual.split("/")]
            for p in parts:
                if p in text_lower:
                    return qual
        elif qual.lower() in text_lower:
            return qual
    return "12th Pass"  # Default fallback


def parse_resume(file_bytes: bytes, filename: str) -> dict:
    """Determine file type and parse fields including name, email, phone, skills, and qualifications."""
    ext = filename.split(".")[-1].lower()
    if ext == "pdf":
        text = extract_text_from_pdf(file_bytes)
    elif ext == "docx":
        text = extract_text_from_docx(file_bytes)
    elif ext in ("txt", "text"):
        text = file_bytes.decode("utf-8", errors="ignore")
    else:
        raise ValueError("Unsupported file format. Only PDF, DOCX, and TXT are allowed.")
        
    email = extract_email(text)
    phone = extract_phone(text)
    skills = extract_skills(text)
    qualification = extract_education(text)
    
    # Simple name guesser based on first line
    name = ""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if lines:
        first_line = lines[0]
        if len(first_line) < 50 and "@" not in first_line and not any(char.isdigit() for char in first_line):
            name = first_line
            
    raw_text_preview = text[:1000]
    
    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "qualification": qualification,
        "projects": [],
        "raw_text_preview": raw_text_preview
    }
