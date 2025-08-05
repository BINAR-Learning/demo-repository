"""
Unit Tests for DataManager Module

This module contains comprehensive unit tests for the DataManager class,
testing data persistence, duplicate detection, CSV operations, and statistics.

Author: AI Assistant
Date: August 5, 2025
Version: 1.0
"""

import unittest
import sys
import os
import tempfile
import shutil
import pandas as pd
from unittest.mock import patch, MagicMock, mock_open
from datetime import datetime

# Add modules to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

# Import directly to avoid __init__.py issues
import modules.data_manager as data_manager_module
DataManager = data_manager_module.DataManager


class TestDataManager(unittest.TestCase):
    """Unit tests for DataManager class"""
    
    def setUp(self):
        """Set up test fixtures before each test method"""
        # Create a temporary directory for test files
        self.test_dir = tempfile.mkdtemp()
        
        # Mock the datetime to ensure consistent session timestamps
        self.test_datetime = "20250805_120000"
        
        with patch('modules.data_manager.datetime') as mock_datetime:
            mock_datetime.now.return_value.strftime.return_value = self.test_datetime
            self.data_manager = DataManager(output_dir=self.test_dir)
    
    def tearDown(self):
        """Clean up test fixtures after each test method"""
        # Remove temporary directory and all its contents
        shutil.rmtree(self.test_dir, ignore_errors=True)
    
    def test_initialization(self):
        """Test DataManager initialization"""
        # Test directory creation
        self.assertTrue(os.path.exists(self.test_dir))
        
        # Test file paths
        expected_csv = os.path.join(self.test_dir, "articles.csv")
        expected_session_csv = os.path.join(self.test_dir, f"articles_{self.test_datetime}.csv")
        expected_log = os.path.join(self.test_dir, f"process_log_{self.test_datetime}.txt")
        
        self.assertEqual(self.data_manager.csv_file, expected_csv)
        self.assertEqual(self.data_manager.session_csv_file, expected_session_csv)
        self.assertEqual(self.data_manager.session_log_file, expected_log)
        
        # Test schema
        expected_schema = ["title", "url", "source_name", "publication_date", "category", "full_text"]
        self.assertEqual(self.data_manager.csv_schema, expected_schema)
        
        # Test log messages initialization
        self.assertIsInstance(self.data_manager.log_messages, list)
        self.assertGreater(len(self.data_manager.log_messages), 0)
        
        # Test categorizer initialization
        self.assertIsNotNone(self.data_manager.categorizer)
    
    def test_log_method(self):
        """Test _log method functionality"""
        initial_count = len(self.data_manager.log_messages)
        
        test_message = "Test log message"
        self.data_manager._log(test_message)
        
        # Check that message was added
        self.assertEqual(len(self.data_manager.log_messages), initial_count + 1)
        
        # Check message format (should include timestamp and message)
        last_message = self.data_manager.log_messages[-1]
        self.assertIn(test_message, last_message)
        self.assertRegex(last_message, r'^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]')
    
    def test_save_session_log_success(self):
        """Test successful session log saving"""
        # Add some log messages
        self.data_manager._log("Test message 1")
        self.data_manager._log("Test message 2")
        
        result = self.data_manager.save_session_log()
        
        self.assertTrue(result)
        self.assertTrue(os.path.exists(self.data_manager.session_log_file))
        
        # Verify file content
        with open(self.data_manager.session_log_file, 'r', encoding='utf-8') as f:
            content = f.read()
            self.assertIn("Test message 1", content)
            self.assertIn("Test message 2", content)
    
    @patch('builtins.open', side_effect=IOError("Permission denied"))
    def test_save_session_log_error(self, mock_open):
        """Test session log saving with file error"""
        result = self.data_manager.save_session_log()
        self.assertFalse(result)
    
    def test_initialize_csv(self):
        """Test CSV file initialization"""
        # Remove the CSV file if it exists
        if os.path.exists(self.data_manager.csv_file):
            os.remove(self.data_manager.csv_file)
        
        self.data_manager.initialize_csv()
        
        # Check file exists
        self.assertTrue(os.path.exists(self.data_manager.csv_file))
        
        # Check file content (should have header only)
        df = pd.read_csv(self.data_manager.csv_file)
        self.assertEqual(len(df), 0)
        self.assertEqual(list(df.columns), self.data_manager.csv_schema)
    
    def test_save_article_new_article(self):
        """Test saving a new article"""
        article_data = {
            "title": "Test Article Title",
            "url": "https://example.com/test-article",
            "source_name": "Test Source",
            "publication_date": "2025-08-05",
            "category": "Fraud",
            "full_text": "This is test article content about fraud case."
        }
        
        result = self.data_manager.save_article(article_data)
        
        self.assertTrue(result)
        
        # Verify article was saved to main CSV
        df = pd.read_csv(self.data_manager.csv_file)
        self.assertEqual(len(df), 1)
        self.assertEqual(df.iloc[0]['title'], article_data['title'])
        self.assertEqual(df.iloc[0]['url'], article_data['url'])
        
        # Verify article was saved to session CSV
        session_df = pd.read_csv(self.data_manager.session_csv_file)
        self.assertEqual(len(session_df), 1)
    
    def test_save_article_duplicate(self):
        """Test saving a duplicate article"""
        article_data = {
            "title": "Test Article",
            "url": "https://example.com/test",
            "source_name": "Test Source",
            "publication_date": "2025-08-05",
            "category": "Fraud",
            "full_text": "Test content"
        }
        
        # Save article first time
        result1 = self.data_manager.save_article(article_data)
        self.assertTrue(result1)
        
        # Try to save same article again
        result2 = self.data_manager.save_article(article_data)
        self.assertFalse(result2)
        
        # Verify only one article in database
        df = pd.read_csv(self.data_manager.csv_file)
        self.assertEqual(len(df), 1)
    
    def test_save_article_auto_categorization(self):
        """Test automatic categorization when category is missing"""
        article_data = {
            "title": "KPK Tangkap Tersangka Korupsi",
            "url": "https://example.com/corruption-case",
            "source_name": "Test Source",
            "publication_date": "2025-08-05",
            "full_text": "KPK menangkap tersangka korupsi yang menerima suap"
        }
        # Note: no 'category' field provided
        
        result = self.data_manager.save_article(article_data)
        
        self.assertTrue(result)
        
        # Verify article was categorized automatically
        df = pd.read_csv(self.data_manager.csv_file)
        self.assertEqual(len(df), 1)
        self.assertEqual(df.iloc[0]['category'], "Corruption")
    
    def test_save_article_missing_fields(self):
        """Test saving article with missing fields"""
        article_data = {
            "title": "Test Article",
            "url": "https://example.com/test"
            # Missing other required fields
        }
        
        result = self.data_manager.save_article(article_data)
        
        self.assertTrue(result)
        
        # Verify missing fields were filled with empty strings
        df = pd.read_csv(self.data_manager.csv_file, keep_default_na=False)
        self.assertEqual(len(df), 1)
        self.assertEqual(df.iloc[0]['source_name'], '')
        self.assertEqual(df.iloc[0]['publication_date'], '')
    
    def test_save_articles_batch(self):
        """Test batch saving of articles"""
        articles = [
            {
                "title": "Article 1",
                "url": "https://example.com/1",
                "source_name": "Source 1",
                "category": "Fraud",
                "full_text": "Content 1"
            },
            {
                "title": "Article 2", 
                "url": "https://example.com/2",
                "source_name": "Source 2",
                "category": "Corruption",
                "full_text": "Content 2"
            }
        ]
        
        saved_count = self.data_manager.save_articles_batch(articles)
        
        self.assertEqual(saved_count, 2)
        
        # Verify all articles were saved
        df = pd.read_csv(self.data_manager.csv_file)
        self.assertEqual(len(df), 2)
    
    def test_save_articles_batch_with_duplicates(self):
        """Test batch saving with some duplicates"""
        # Save one article first
        article1 = {
            "title": "Article 1",
            "url": "https://example.com/1",
            "source_name": "Source 1",
            "category": "Fraud",
            "full_text": "Content 1"
        }
        self.data_manager.save_article(article1)
        
        # Try to save batch including the duplicate
        articles = [
            article1,  # Duplicate
            {
                "title": "Article 2",
                "url": "https://example.com/2", 
                "source_name": "Source 2",
                "category": "Corruption",
                "full_text": "Content 2"
            }
        ]
        
        saved_count = self.data_manager.save_articles_batch(articles)
        
        self.assertEqual(saved_count, 1)  # Only one new article saved
        
        # Verify total articles in database
        df = pd.read_csv(self.data_manager.csv_file)
        self.assertEqual(len(df), 2)
    
    def test_load_articles_existing_file(self):
        """Test loading articles from existing CSV file"""
        # Create test CSV file
        test_data = pd.DataFrame([
            {
                "title": "Test Article",
                "url": "https://example.com/test",
                "source_name": "Test Source",
                "publication_date": "2025-08-05",
                "category": "Fraud",
                "full_text": "Test content"
            }
        ])
        test_data.to_csv(self.data_manager.csv_file, index=False)
        
        df = self.data_manager.load_articles()
        
        self.assertEqual(len(df), 1)
        self.assertEqual(df.iloc[0]['title'], "Test Article")
    
    def test_load_articles_no_file(self):
        """Test loading articles when no CSV file exists"""
        # Remove CSV file if it exists
        if os.path.exists(self.data_manager.csv_file):
            os.remove(self.data_manager.csv_file)
        
        df = self.data_manager.load_articles()
        
        # Should return empty DataFrame with correct schema
        self.assertEqual(len(df), 0)
        self.assertEqual(list(df.columns), self.data_manager.csv_schema)
    
    def test_get_articles_count_existing_file(self):
        """Test getting article count from existing file"""
        # Create test CSV with 3 articles
        test_data = pd.DataFrame([
            {"title": "Article 1", "url": "https://example.com/1"},
            {"title": "Article 2", "url": "https://example.com/2"},
            {"title": "Article 3", "url": "https://example.com/3"}
        ])
        test_data.to_csv(self.data_manager.csv_file, index=False)
        
        count = self.data_manager.get_articles_count()
        self.assertEqual(count, 3)
    
    def test_get_articles_count_no_file(self):
        """Test getting article count when no file exists"""
        if os.path.exists(self.data_manager.csv_file):
            os.remove(self.data_manager.csv_file)
        
        count = self.data_manager.get_articles_count()
        self.assertEqual(count, 0)
    
    def test_check_duplicate_existing_url(self):
        """Test duplicate checking with existing URL"""
        # Save an article first
        test_data = pd.DataFrame([
            {"url": "https://example.com/test"}
        ])
        test_data.to_csv(self.data_manager.csv_file, index=False)
        
        # Check for duplicate (case insensitive)
        is_duplicate = self.data_manager.check_duplicate("https://example.com/test")
        self.assertTrue(is_duplicate)
        
        is_duplicate_case = self.data_manager.check_duplicate("HTTPS://EXAMPLE.COM/TEST")
        self.assertTrue(is_duplicate_case)
    
    def test_check_duplicate_new_url(self):
        """Test duplicate checking with new URL"""
        # Save an article first
        test_data = pd.DataFrame([
            {"url": "https://example.com/existing"}
        ])
        test_data.to_csv(self.data_manager.csv_file, index=False)
        
        # Check for new URL
        is_duplicate = self.data_manager.check_duplicate("https://example.com/new")
        self.assertFalse(is_duplicate)
    
    def test_check_duplicate_empty_url(self):
        """Test duplicate checking with empty URL"""
        is_duplicate = self.data_manager.check_duplicate("")
        self.assertFalse(is_duplicate)
        
        is_duplicate_none = self.data_manager.check_duplicate(None)
        self.assertFalse(is_duplicate_none)
    
    def test_get_duplicate_urls(self):
        """Test getting list of duplicate URLs"""
        # Save some articles first
        test_data = pd.DataFrame([
            {"url": "https://example.com/1"},
            {"url": "https://example.com/2"},
            {"url": "https://example.com/3"}
        ])
        test_data.to_csv(self.data_manager.csv_file, index=False)
        
        urls_to_check = [
            "https://example.com/1",  # Duplicate
            "https://example.com/4",  # New
            "https://example.com/2",  # Duplicate
            "https://example.com/5"   # New
        ]
        
        duplicates = self.data_manager.get_duplicate_urls(urls_to_check)
        
        self.assertEqual(len(duplicates), 2)
        self.assertIn("https://example.com/1", duplicates)
        self.assertIn("https://example.com/2", duplicates)
    
    def test_get_statistics_with_data(self):
        """Test getting statistics from populated database"""
        # Create test data
        test_data = pd.DataFrame([
            {
                "source_name": "Source A",
                "category": "Fraud",
                "publication_date": "2025-08-01"
            },
            {
                "source_name": "Source A", 
                "category": "Corruption",
                "publication_date": "2025-08-02"
            },
            {
                "source_name": "Source B",
                "category": "Fraud",
                "publication_date": "2025-08-03"
            }
        ])
        test_data.to_csv(self.data_manager.csv_file, index=False)
        
        stats = self.data_manager.get_statistics()
        
        self.assertEqual(stats['total_articles'], 3)
        self.assertEqual(stats['sources']['Source A'], 2)
        self.assertEqual(stats['sources']['Source B'], 1)
        self.assertEqual(stats['categories']['Fraud'], 2)
        self.assertEqual(stats['categories']['Corruption'], 1)
        self.assertIsNotNone(stats['date_range'])
    
    def test_get_statistics_empty_database(self):
        """Test getting statistics from empty database"""
        if os.path.exists(self.data_manager.csv_file):
            os.remove(self.data_manager.csv_file)
        
        stats = self.data_manager.get_statistics()
        
        expected_stats = {
            'total_articles': 0,
            'sources': {},
            'categories': {},
            'date_range': None
        }
        self.assertEqual(stats, expected_stats)
    
    @patch('pandas.DataFrame.to_csv', side_effect=Exception("File write error"))
    def test_save_article_exception_handling(self, mock_to_csv):
        """Test exception handling in save_article"""
        article_data = {
            "title": "Test Article",
            "url": "https://example.com/test",
            "source_name": "Test Source"
        }
        
        result = self.data_manager.save_article(article_data)
        # Should handle exception gracefully
        self.assertFalse(result)
    
    @patch('pandas.read_csv', side_effect=Exception("File read error"))
    def test_load_articles_exception_handling(self, mock_read_csv):
        """Test exception handling in load_articles"""
        df = self.data_manager.load_articles()
        
        # Should return empty DataFrame with correct schema
        self.assertEqual(len(df), 0)
        self.assertEqual(list(df.columns), self.data_manager.csv_schema)
    
    @patch('pandas.read_csv', side_effect=Exception("File read error"))
    def test_check_duplicate_exception_handling(self, mock_read_csv):
        """Test exception handling in check_duplicate"""
        # Create CSV file first
        pd.DataFrame({"url": ["test"]}).to_csv(self.data_manager.csv_file, index=False)
        
        # Should handle exception and return False (allow saving to avoid data loss)
        result = self.data_manager.check_duplicate("https://example.com/test")
        self.assertFalse(result)
    
    @patch('pandas.read_csv', side_effect=Exception("File read error"))
    def test_get_statistics_exception_handling(self, mock_read_csv):
        """Test exception handling in get_statistics"""
        # Create CSV file first
        pd.DataFrame({"test": ["data"]}).to_csv(self.data_manager.csv_file, index=False)
        
        stats = self.data_manager.get_statistics()
        
        expected_stats = {
            'total_articles': 0,
            'sources': {},
            'categories': {},
            'date_range': None
        }
        self.assertEqual(stats, expected_stats)


if __name__ == '__main__':
    unittest.main(verbosity=2)
