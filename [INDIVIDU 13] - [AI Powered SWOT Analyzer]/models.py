from pydantic import BaseModel, Field
from typing import List, Optional


class SWOTRequest(BaseModel):
    """Request model for SWOT analysis"""
    business_description: str = Field(..., min_length=10, description="Description of the business to analyze")
    company_name: Optional[str] = Field(default="", description="Optional company name")
    
    class Config:
        json_schema_extra = {
            "example": {
                "business_description": "A local coffee shop in Jakarta that serves specialty coffee and pastries",
                "company_name": "Coffee Corner"
            }
        }


class SWOTResponse(BaseModel):
    """Response model for SWOT analysis results"""
    strengths: List[str] = Field(..., description="List of business strengths")
    weaknesses: List[str] = Field(..., description="List of business weaknesses") 
    opportunities: List[str] = Field(..., description="List of business opportunities")
    threats: List[str] = Field(..., description="List of business threats")
    company_name: Optional[str] = Field(default="", description="Company name if provided")
    
    class Config:
        json_schema_extra = {
            "example": {
                "strengths": [
                    "High-quality specialty coffee",
                    "Local neighborhood presence",
                    "Cozy atmosphere"
                ],
                "weaknesses": [
                    "Limited seating capacity",
                    "Higher prices than chains",
                    "Limited marketing budget"
                ],
                "opportunities": [
                    "Online delivery expansion",
                    "Corporate catering services",
                    "Social media marketing"
                ],
                "threats": [
                    "Competition from coffee chains",
                    "Rising rent costs",
                    "Economic downturn affecting spending"
                ],
                "company_name": "Coffee Corner"
            }
        }


class AnalysisHistory(BaseModel):
    """Model for storing analysis history"""
    id: str
    timestamp: str
    request: SWOTRequest
    response: SWOTResponse
