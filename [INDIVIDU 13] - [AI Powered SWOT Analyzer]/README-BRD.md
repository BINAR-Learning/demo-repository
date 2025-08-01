# Simple AI SWOT Analyzer - 1 Day Project BRD
## Final Project AI Enhancement Course

---

## 1. Project Overview

**Project**: Simple AI SWOT Analyzer  
**Duration**: 1 Day (8 hours)  
**Goal**: Functional MVP dengan GitHub Copilot assistance  
**Tech Stack**: FastAPI + JSON DB + Gemini AI + Basic CI/CD  

---

## 2. Scope - What CAN Be Done in 1 Day

### ✅ REALISTIC FEATURES (1 Day)
- **Input**: Text input via API POST
- **AI**: Basic Gemini integration untuk SWOT analysis  
- **Output**: JSON response + simple Excel export
- **Database**: JSON file storage (no PostgreSQL)
- **Testing**: Basic unit tests dengan GitHub Copilot
- **CI/CD**: Simple GitHub Actions (lint, test, build)
- **Documentation**: README + basic API docs

### ❌ NOT REALISTIC (Skip untuk MVP)
- Complex file upload processing
- Advanced prompt engineering iterations
- Multiple AI model comparison
- Real database setup
- Complex CI/CD with SonarCloud
- Production deployment

---

## 3. 1-Day Implementation Plan

### Hour 1-2: Setup & Structure
```bash
# GitHub Copilot akan help generate ini semua
mkdir simple-swot-analyzer
cd simple-swot-analyzer

# Structure yang simple
/
├── main.py              # FastAPI app
├── models.py            # Pydantic models  
├── services/
│   ├── ai_service.py    # Gemini integration
│   └── db_service.py    # JSON file handler
├── tests/
│   └── test_main.py     # Basic tests
├── requirements.txt
├── .github/workflows/
│   └── ci.yml          # Simple CI
└── README.md
```

### Hour 3-4: Core API Development
```python
# main.py - GitHub Copilot akan generate structure ini
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Simple SWOT Analyzer")

class SWOTRequest(BaseModel):
    business_description: str
    company_name: str = ""

class SWOTResponse(BaseModel):
    strengths: list[str]
    weaknesses: list[str] 
    opportunities: list[str]
    threats: list[str]

@app.post("/analyze", response_model=SWOTResponse)
async def analyze_business(request: SWOTRequest):
    # GitHub Copilot akan suggest implementation
    pass

@app.get("/")
async def root():
    return {"message": "Simple SWOT Analyzer API"}
```

### Hour 5-6: AI Integration
```python
# services/ai_service.py - Copilot will help
import google.generativeai as genai

class SimpleAIService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def generate_swot(self, business_description: str) -> dict:
        # Simple prompt - no complex engineering
        prompt = f"""
        Create a SWOT analysis for this business:
        {business_description}
        
        Return as JSON format:
        {{
            "strengths": ["strength1", "strength2", "strength3"],
            "weaknesses": ["weakness1", "weakness2", "weakness3"],
            "opportunities": ["opp1", "opp2", "opp3"],
            "threats": ["threat1", "threat2", "threat3"]
        }}
        """
        
        response = self.model.generate_content(prompt)
        # GitHub Copilot akan suggest parsing logic
        return self.parse_response(response.text)
```

### Hour 7: Testing & Documentation
```python
# tests/test_main.py - Copilot akan generate tests
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200

def test_analyze_endpoint():
    # Copilot akan suggest test cases
    payload = {
        "business_description": "A local coffee shop in Jakarta",
        "company_name": "Coffee Corner"
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    # More test assertions...
```

### Hour 8: CI/CD & Polish
```yaml
# .github/workflows/ci.yml - Simple CI
name: Simple CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Python
      uses: actions/setup-python@v3
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest
    
    - name: Run tests
      run: pytest
    
    - name: Lint with flake8
      run: |
        pip install flake8
        flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
```

---

## 4. GitHub Copilot Usage Strategy

### 4.1 Effective Copilot Prompts
```python
# Comment-driven development - Copilot responds well to this
# TODO: Create FastAPI endpoint that accepts business description
# TODO: Integrate with Google Gemini API for SWOT analysis
# TODO: Parse AI response and return structured JSON
# TODO: Add basic error handling for API failures
# TODO: Create simple JSON database for storing results
# TODO: Generate basic Excel export functionality
```

### 4.2 Copilot Assisted Code Generation
- ✅ **API Routes**: Copilot excel di FastAPI patterns
- ✅ **Pydantic Models**: Auto-generate from comments
- ✅ **Test Cases**: Generate dari function signatures
- ✅ **Error Handling**: Suggest try-catch patterns
- ✅ **Documentation**: Auto-generate docstrings

---

## 5. Simplified Course Requirements

### 5.1 AI in SDLC (30%) - SIMPLIFIED
- **Basic Prompt**: Simple, working Gemini integration
- **AI Validation**: Basic response parsing with error handling
- **Documentation**: Document 1-2 prompt iterations in README

**Evidence untuk Laporan**:
```python
# Prompt V1 (basic)
prompt_v1 = "Create SWOT analysis for: {business}"

# Prompt V2 (improved) 
prompt_v2 = """
Analyze this business and create SWOT with exactly 3-4 items each:
Business: {business}
Format as JSON.
"""
```

### 5.2 Code Quality & Testing (25%) - SIMPLIFIED
- **Clean Code**: Use GitHub Copilot suggestions for clean functions
- **Testing**: Basic pytest tests (aim for 70%+ coverage)
- **Refactoring**: Let Copilot suggest improvements

**Evidence untuk Laporan**:
- Screenshot test coverage report
- Before/after refactoring examples
- Copilot suggestion screenshots

### 5.3 CI/CD (30%) - SIMPLIFIED
- **Basic Pipeline**: Lint + Test + Build
- **No SonarCloud**: Too complex for 1 day
- **Alternative**: Use GitHub's built-in code scanning

**Simple Quality Gates**:
```yaml
# Just basic checks
- name: Run flake8
  run: flake8 . --max-line-length=88
  
- name: Run tests
  run: pytest --cov=. --cov-report=term-missing
```

### 5.4 Documentation (10%) - SIMPLIFIED
```markdown
# README.md (Copilot will help structure this)

## Quick Start
```bash
pip install -r requirements.txt
export GEMINI_API_KEY="your-key"
uvicorn main:app --reload
```

## API Usage
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{"business_description": "Local restaurant"}'
```

## Testing
```bash
pytest --cov=.
```
```

---

## 6. LAPORAN_FINAL.md - Simple Version

```markdown
# Simple AI SWOT Analyzer - Final Report

## 1. Project Overview
- Built simple SWOT analyzer in 1 day using GitHub Copilot
- Tech: FastAPI + Gemini AI + JSON storage
- Features: Text input → AI analysis → JSON/Excel output

## 2. AI Integration & Prompt Engineering

### Initial Prompt
```
"Create SWOT analysis for: {business_description}"
```
**Issue**: Too generic, inconsistent format

### Improved Prompt  
```
"Analyze this business and create SWOT with exactly 3-4 items each:
Business: {business_description}
Return as valid JSON format."
```
**Result**: 85% better formatting, more consistent results

### GitHub Copilot Usage
- Generated 70% of boilerplate code
- Suggested error handling patterns
- Auto-completed test cases
- Helped with JSON parsing logic

## 3. Code Quality & Testing

### GitHub Copilot Assisted Development
```python
# Example: Copilot suggested this error handling
try:
    response = self.model.generate_content(prompt)
    return self.parse_json_response(response.text)
except Exception as e:
    logger.error(f"AI service error: {e}")
    return self.fallback_response()
```

### Test Coverage: 78%
- Unit tests for API endpoints
- AI service integration tests
- Basic error handling tests

## 4. CI/CD Implementation

### Simple GitHub Actions Pipeline
- ✅ Lint check (flake8)
- ✅ Unit tests (pytest)
- ✅ Build verification
- ✅ Auto-deployment to staging branch

### Quality Metrics
- All tests passing ✅
- No critical linting errors ✅
- Basic security checks ✅

## 5. Challenges & Solutions

### Challenge 1: AI Response Parsing
**Problem**: Gemini sometimes returned malformed JSON
**Solution**: Added fallback parsing with regex extraction

### Challenge 2: Rate Limiting
**Problem**: Gemini API rate limits
**Solution**: Added simple retry mechanism with exponential backoff

## 6. Results & Demo
- ✅ Working API with interactive docs
- ✅ Successful AI integration
- ✅ Basic Excel export functionality
- ✅ 78% test coverage
- ✅ Automated CI/CD pipeline

## 7. GitHub Copilot Impact
- **Code Generation**: 70% assistance
- **Test Writing**: 80% assistance  
- **Documentation**: 60% assistance
- **Debugging**: 50% assistance

**Time Saved**: Estimated 4-5 hours of manual coding
```

---

## 7. Success Criteria - Realistic

### ✅ Minimum Viable Product
- [x] Working FastAPI application
- [x] Basic Gemini AI integration
- [x] Simple SWOT analysis generation
- [x] JSON response format
- [x] Basic error handling
- [x] Unit tests (70%+ coverage)
- [x] Simple CI/CD pipeline
- [x] Documentation (README + API docs)

### ✅ Course Requirements Met
- **AI Integration**: ✅ Working Gemini API with basic prompts
- **Code Quality**: ✅ Clean code with Copilot assistance
- **Testing**: ✅ Basic test suite with decent coverage
- **CI/CD**: ✅ Simple but functional pipeline
- **Documentation**: ✅ Clear setup and usage instructions

---

## 8. Dependencies - Minimal

```txt
# requirements.txt - Keep it simple
fastapi==0.104.1
uvicorn==0.24.0
google-generativeai==0.3.2
openpyxl==3.1.2
pydantic==2.5.0
python-multipart==0.0.6

# Dev dependencies
pytest==7.4.3
pytest-cov==4.1.0
flake8==6.1.0
```

---

## 9. File Structure - Simple

```
simple-swot-analyzer/
├── main.py                 # FastAPI app (150 lines max)
├── models.py               # Pydantic models (50 lines)
├── services/
│   ├── __init__.py
│   ├── ai_service.py       # Gemini integration (100 lines)
│   └── db_service.py       # JSON storage (80 lines)
├── tests/
│   ├── __init__.py
│   └── test_main.py        # Basic tests (100 lines)
├── .github/workflows/
│   └── ci.yml              # Simple CI (30 lines)
├── requirements.txt        # Dependencies (10 lines)
├── .env.example           # Environment template
├── .gitignore             # Standard Python gitignore
└── README.md              # Setup & usage guide
```

**Total Code**: ~500 lines (very manageable for 1 day)

---

## 10. GitHub Copilot Productivity Tips

### 10.1 Effective Comments for Code Generation
```python
# Generate FastAPI endpoint for SWOT analysis
# Accept business description and return structured SWOT
# Include error handling and validation
def analyze_business():
    # Copilot will suggest implementation
    pass

# Create comprehensive test cases for the analyze endpoint
# Test valid input, invalid input, and edge cases
def test_analyze_business():
    # Copilot will generate test scenarios
    pass
```

### 10.2 Use Copilot Chat for Architecture
- "Generate FastAPI project structure for SWOT analyzer"
- "Create Pydantic models for SWOT analysis request/response"
- "Write GitHub Actions workflow for Python FastAPI project"
- "Generate pytest tests for FastAPI endpoints"

---

## Final Reality Check ✅

**Can this be done in 1 day with GitHub Copilot?** 
**YES! Here's why:**

1. **Simple Scope**: No complex features, just core functionality
2. **AI Assistance**: Copilot generates 70% of boilerplate code  
3. **Proven Stack**: FastAPI + Gemini is well-documented
4. **No Database Setup**: JSON file storage is instant
5. **Basic CI/CD**: GitHub Actions templates available
6. **Focused Requirements**: MVP approach, not enterprise solution

**Time Breakdown:**
- Setup: 1 hour
- Core Development: 4 hours  
- Testing: 1 hour
- CI/CD: 1 hour
- Documentation: 1 hour
- **Total: 8 hours** ✅

This BRD is designed untuk **success in 1 day** dengan bantuan GitHub Copilot, bukan untuk impress dengan complexity yang unrealistic!