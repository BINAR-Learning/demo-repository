import os
import json
import logging
import re
from typing import Dict, Any, Optional
import google.generativeai as genai
from models import SWOTResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SimpleAIService:
    """Simple AI service for generating SWOT analysis using Google Gemini"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the AI service with Gemini API key"""
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY is required")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Improved prompt template
        self.prompt_template = """
Analyze this business and create a comprehensive SWOT analysis with exactly 3-4 items for each category.

Business Description: {business_description}
Company Name: {company_name}

Please provide a structured SWOT analysis in the following JSON format:
{{
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2", "weakness3"],
    "opportunities": ["opportunity1", "opportunity2", "opportunity3"],
    "threats": ["threat1", "threat2", "threat3"]
}}

Guidelines:
- Each item should be concise but descriptive (1-2 sentences max)
- Focus on realistic and actionable insights
- Consider industry context and market conditions
- Return ONLY the JSON format, no additional text
"""

    def generate_swot(self, business_description: str, company_name: str = "") -> Dict[str, Any]:
        """Generate SWOT analysis for given business description"""
        try:
            # Format the prompt
            prompt = self.prompt_template.format(
                business_description=business_description,
                company_name=company_name or "the business"
            )
            
            # Generate content using Gemini
            logger.info(f"Generating SWOT analysis for: {company_name or 'business'}")
            response = self.model.generate_content(prompt)
            
            # Parse the response
            swot_data = self.parse_json_response(response.text)
            
            # Validate and return
            return self.validate_swot_data(swot_data)
            
        except Exception as e:
            logger.error(f"AI service error: {e}")
            return self.fallback_response(business_description, company_name)

    def parse_json_response(self, response_text: str) -> Dict[str, Any]:
        """Parse JSON response from AI model with fallback options"""
        try:
            # Clean the response text
            cleaned_text = response_text.strip()
            
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', cleaned_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
            
            # If no JSON found, try parsing the entire response
            return json.loads(cleaned_text)
            
        except json.JSONDecodeError as e:
            logger.warning(f"JSON parsing failed: {e}")
            # Try regex extraction as fallback
            return self.extract_swot_with_regex(response_text)

    def extract_swot_with_regex(self, text: str) -> Dict[str, Any]:
        """Extract SWOT elements using regex patterns"""
        swot_data = {
            "strengths": [],
            "weaknesses": [],
            "opportunities": [],
            "threats": []
        }
        
        patterns = {
            "strengths": r"strengths?[\":\s]*\[(.*?)\]",
            "weaknesses": r"weaknesses?[\":\s]*\[(.*?)\]",
            "opportunities": r"opportunities?[\":\s]*\[(.*?)\]",
            "threats": r"threats?[\":\s]*\[(.*?)\]"
        }
        
        for category, pattern in patterns.items():
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                items_str = match.group(1)
                # Extract quoted strings
                items = re.findall(r'"([^"]*)"', items_str)
                swot_data[category] = items[:4]  # Limit to 4 items
        
        return swot_data

    def validate_swot_data(self, swot_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean SWOT data"""
        required_keys = ["strengths", "weaknesses", "opportunities", "threats"]
        
        # Ensure all required keys exist
        for key in required_keys:
            if key not in swot_data or not isinstance(swot_data[key], list):
                swot_data[key] = []
        
        # Ensure each category has at least 1 item and at most 4 items
        for key in required_keys:
            items = swot_data[key]
            if len(items) == 0:
                swot_data[key] = [f"No specific {key[:-1]} identified"]
            elif len(items) > 4:
                swot_data[key] = items[:4]
        
        return swot_data

    def fallback_response(self, business_description: str, company_name: str = "") -> Dict[str, Any]:
        """Provide fallback SWOT analysis when AI fails"""
        logger.info("Using fallback SWOT analysis")
        
        return {
            "strengths": [
                "Identified business opportunity",
                "Specific market focus",
                "Clear business concept"
            ],
            "weaknesses": [
                "Limited analysis data available",
                "Requires more detailed business information",
                "AI analysis temporarily unavailable"
            ],
            "opportunities": [
                "Market research and validation",
                "Business plan development",
                "Strategic planning initiatives"
            ],
            "threats": [
                "Competitive market conditions",
                "Economic uncertainties",
                "Need for detailed market analysis"
            ]
        }
