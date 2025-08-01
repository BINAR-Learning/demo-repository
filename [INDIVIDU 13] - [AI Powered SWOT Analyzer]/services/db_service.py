import json
import os
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging
from models import AnalysisHistory, SWOTRequest, SWOTResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SimpleDBService:
    """Simple JSON file-based database service for storing SWOT analysis history"""
    
    def __init__(self, db_file: str = "swot_history.json"):
        """Initialize the database service with JSON file storage"""
        self.db_file = db_file
        self.ensure_db_exists()
    
    def ensure_db_exists(self) -> None:
        """Ensure the database file exists with proper structure"""
        if not os.path.exists(self.db_file):
            initial_data = {
                "analyses": [],
                "metadata": {
                    "created_at": datetime.now().isoformat(),
                    "total_analyses": 0
                }
            }
            self.save_data(initial_data)
            logger.info(f"Created new database file: {self.db_file}")
    
    def load_data(self) -> Dict[str, Any]:
        """Load data from JSON file"""
        try:
            with open(self.db_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.error(f"Error loading database: {e}")
            # Return empty structure if file is corrupted
            return {
                "analyses": [],
                "metadata": {
                    "created_at": datetime.now().isoformat(),
                    "total_analyses": 0
                }
            }
    
    def save_data(self, data: Dict[str, Any]) -> None:
        """Save data to JSON file"""
        try:
            with open(self.db_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error saving database: {e}")
            raise
    
    def save_analysis(self, request: SWOTRequest, response: SWOTResponse) -> str:
        """Save a new SWOT analysis to the database"""
        try:
            # Generate unique ID
            analysis_id = str(uuid.uuid4())
            timestamp = datetime.now().isoformat()
            
            # Create analysis record
            analysis = AnalysisHistory(
                id=analysis_id,
                timestamp=timestamp,
                request=request,
                response=response
            )
            
            # Load existing data
            data = self.load_data()
            
            # Add new analysis
            data["analyses"].append(analysis.model_dump())
            data["metadata"]["total_analyses"] = len(data["analyses"])
            data["metadata"]["last_updated"] = timestamp
            
            # Save updated data
            self.save_data(data)
            
            logger.info(f"Saved analysis with ID: {analysis_id}")
            return analysis_id
            
        except Exception as e:
            logger.error(f"Error saving analysis: {e}")
            raise
    
    def get_analysis_by_id(self, analysis_id: str) -> Optional[AnalysisHistory]:
        """Retrieve a specific analysis by ID"""
        try:
            data = self.load_data()
            for analysis_data in data["analyses"]:
                if analysis_data["id"] == analysis_id:
                    return AnalysisHistory(**analysis_data)
            return None
        except Exception as e:
            logger.error(f"Error retrieving analysis {analysis_id}: {e}")
            return None
    
    def get_recent_analyses(self, limit: int = 10) -> List[AnalysisHistory]:
        """Get the most recent analyses"""
        try:
            data = self.load_data()
            analyses = data["analyses"]
            
            # Sort by timestamp (most recent first)
            sorted_analyses = sorted(
                analyses, 
                key=lambda x: x["timestamp"], 
                reverse=True
            )
            
            # Return limited results
            recent = sorted_analyses[:limit]
            return [AnalysisHistory(**analysis) for analysis in recent]
            
        except Exception as e:
            logger.error(f"Error retrieving recent analyses: {e}")
            return []
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics"""
        try:
            data = self.load_data()
            total_analyses = len(data["analyses"])
            
            if total_analyses == 0:
                return {
                    "total_analyses": 0,
                    "first_analysis": None,
                    "last_analysis": None,
                    "most_common_strengths": [],
                    "most_common_weaknesses": []
                }
            
            # Calculate some basic statistics
            analyses = data["analyses"]
            first_analysis = min(analyses, key=lambda x: x["timestamp"])
            last_analysis = max(analyses, key=lambda x: x["timestamp"])
            
            return {
                "total_analyses": total_analyses,
                "first_analysis": first_analysis["timestamp"],
                "last_analysis": last_analysis["timestamp"],
                "database_size_kb": round(os.path.getsize(self.db_file) / 1024, 2) if os.path.exists(self.db_file) else 0
            }
            
        except Exception as e:
            logger.error(f"Error getting statistics: {e}")
            return {"error": str(e)}
    
    def clear_database(self) -> bool:
        """Clear all data from the database (use with caution)"""
        try:
            initial_data = {
                "analyses": [],
                "metadata": {
                    "created_at": datetime.now().isoformat(),
                    "total_analyses": 0,
                    "cleared_at": datetime.now().isoformat()
                }
            }
            self.save_data(initial_data)
            logger.warning("Database cleared successfully")
            return True
        except Exception as e:
            logger.error(f"Error clearing database: {e}")
            return False
