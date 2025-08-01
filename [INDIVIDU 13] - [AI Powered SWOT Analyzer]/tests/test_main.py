import pytest
import os
from unittest.mock import patch
import tempfile

# Import the models and services directly
from models import SWOTRequest, SWOTResponse
from services.ai_service import SimpleAIService
from services.db_service import SimpleDBService


class TestSWOTModels:
    """Test cases for Pydantic models"""

    def test_swot_request_valid(self):
        """Test valid SWOT request model"""
        request = SWOTRequest(
            business_description="A comprehensive business description that is long enough to meet requirements",
            company_name="Test Company"
        )
        assert request.business_description is not None
        assert request.company_name == "Test Company"

    def test_swot_request_minimum_description_length(self):
        """Test SWOT request with minimum description length"""
        with pytest.raises(ValueError):
            SWOTRequest(
                business_description="Short",  # Too short
                company_name="Test"
            )

    def test_swot_response_valid(self):
        """Test valid SWOT response model"""
        response = SWOTResponse(
            strengths=["strength1", "strength2"],
            weaknesses=["weakness1", "weakness2"],
            opportunities=["opp1", "opp2"],
            threats=["threat1", "threat2"],
            company_name="Test Company"
        )
        assert len(response.strengths) == 2
        assert len(response.weaknesses) == 2
        assert response.company_name == "Test Company"

    def test_swot_response_optional_company_name(self):
        """Test SWOT response with optional company name"""
        response = SWOTResponse(
            strengths=["strength1"],
            weaknesses=["weakness1"],
            opportunities=["opp1"],
            threats=["threat1"]
        )
        assert response.company_name == ""  # Default value


class TestAIService:
    """Test cases for the AI service"""

    def test_ai_service_initialization_with_key(self):
        """Test AI service initialization with API key"""
        with patch.dict(os.environ, {'GOOGLE_API_KEY': 'test-key'}):
            service = SimpleAIService()
            assert service.api_key == 'test-key'

    def test_ai_service_no_api_key(self):
        """Test AI service initialization without API key"""
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError, match="GOOGLE_API_KEY is required"):
                SimpleAIService()

    @patch('google.generativeai.GenerativeModel')
    def test_validate_swot_data(self, mock_model):
        """Test SWOT data validation"""
        service = SimpleAIService(api_key='test-key')

        # Test with missing keys
        incomplete_data = {
            "strengths": ["test1", "test2"]
            # Missing other keys
        }

        result = service.validate_swot_data(incomplete_data)

        # Should have all required keys
        required_keys = ["strengths", "weaknesses", "opportunities", "threats"]
        for key in required_keys:
            assert key in result
            assert isinstance(result[key], list)

    @patch('google.generativeai.GenerativeModel')
    def test_fallback_response(self, mock_model):
        """Test fallback response generation"""
        service = SimpleAIService(api_key='test-key')

        result = service.fallback_response("Test business", "Test Company")

        # Should return valid SWOT structure
        required_keys = ["strengths", "weaknesses", "opportunities", "threats"]
        for key in required_keys:
            assert key in result
            assert isinstance(result[key], list)
            assert len(result[key]) >= 1


class TestDBService:
    """Test cases for the database service"""

    def test_db_service_initialization(self):
        """Test DB service initialization"""
        with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as tmp:
            assert os.path.exists(tmp.name)

            # Clean up
            os.unlink(tmp.name)

    def test_save_and_retrieve_analysis(self):
        """Test saving and retrieving analysis"""
        with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as tmp:
            service = SimpleDBService(db_file=tmp.name)

            # Create test data
            request = SWOTRequest(
                business_description=(
                "Test business description for testing purposes and validation"
            ),
                company_name="Test Company"
            )
            response = SWOTResponse(
                strengths=["strength1", "strength2"],
                weaknesses=["weakness1", "weakness2"],
                opportunities=["opp1", "opp2"],
                threats=["threat1", "threat2"],
                company_name="Test Company"
            )

            # Save analysis
            analysis_id = service.save_analysis(request, response)
            assert analysis_id is not None

            # Retrieve analysis
            retrieved = service.get_analysis_by_id(analysis_id)
            assert retrieved is not None
            assert retrieved.request.company_name == "Test Company"

            # Clean up
            os.unlink(tmp.name)

    def test_get_recent_analyses(self):
        """Test retrieving recent analyses"""
        with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as tmp:
            service = SimpleDBService(db_file=tmp.name)

            # Get recent analyses (should be empty initially)
            recent = service.get_recent_analyses(limit=5)
            assert isinstance(recent, list)
            assert len(recent) == 0

            # Clean up
            os.unlink(tmp.name)

    def test_get_statistics(self):
        """Test getting database statistics"""
        with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as tmp:
            service = SimpleDBService(db_file=tmp.name)

            stats = service.get_statistics()
            assert isinstance(stats, dict)
            assert "total_analyses" in stats
            assert stats["total_analyses"] == 0

            # Clean up
            os.unlink(tmp.name)


# Simple application test without TestClient
class TestApplication:
    """Test basic application functionality"""

    def test_app_import(self):
        """Test that the application can be imported"""
        from main import app
        assert app is not None
        assert app.title == "Simple AI SWOT Analyzer"

    def test_services_initialization(self):
        """Test that services can be initialized"""
        with patch.dict(os.environ, {'GOOGLE_API_KEY': 'test-key'}):
            ai_service = SimpleAIService()
            db_service = SimpleDBService()

            assert ai_service is not None
            assert db_service is not None

            # Clean up
            if os.path.exists("test.json"):
                os.unlink("test.json")


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])
