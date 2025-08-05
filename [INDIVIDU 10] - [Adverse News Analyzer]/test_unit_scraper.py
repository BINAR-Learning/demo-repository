"""
Unit Tests for NewsScraper Module

This module contains comprehensive unit tests for the NewsScraper class,
testing URL validation, keyword filtering, content extraction, and error handling.

Author: AI Assistant  
Date: August 5, 2025
Version: 1.0
"""

import unittest
import sys
import os
import requests
from unittest.mock import patch, MagicMock, Mock
from datetime import datetime

# Add modules to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

# Import directly to avoid __init__.py issues  
import modules.scraper as scraper_module
NewsScraper = scraper_module.NewsScraper


class TestNewsScraper(unittest.TestCase):
    """Unit tests for NewsScraper class"""
    
    def setUp(self):
        """Set up test fixtures before each test method"""
        with patch('modules.scraper.DataManager'):
            self.scraper = NewsScraper()
    
    def test_initialization(self):
        """Test NewsScraper initialization"""
        # Test that sources are properly configured
        self.assertIsInstance(self.scraper.sources, dict)
        self.assertGreater(len(self.scraper.sources), 0)
        
        # Test that each source has required configuration
        for source_name, config in self.scraper.sources.items():
            self.assertIn('category_urls', config)
            self.assertIn('article_selector', config)
            self.assertIn('title_selector', config)
            self.assertIn('content_selector', config)
            self.assertIn('date_selector', config)
            self.assertIsInstance(config['category_urls'], list)
            self.assertGreater(len(config['category_urls']), 0)
        
        # Test keyword lists
        self.assertIsInstance(self.scraper.abu_keywords, list)
        self.assertIsInstance(self.scraper.crime_keywords, list)
        self.assertGreater(len(self.scraper.abu_keywords), 0)
        self.assertGreater(len(self.scraper.crime_keywords), 0)
        
        # Test session configuration
        self.assertIsInstance(self.scraper.session, requests.Session)
        self.assertIn('User-Agent', self.scraper.session.headers)
    
    def test_is_article_url_valid_urls(self):
        """Test _is_article_url with valid article URLs"""
        # URLs that should be recognized as articles
        valid_urls = [
            "https://www.cnnindonesia.com/nasional/20250805-artikel-berita",
            "https://tempo.co/read/2025/08/05/nasional/artikel.html",
            "https://finance.detik.com/berita-ekonomi-bisnis/d-123456/artikel-title",
            "https://www.antaranews.com/berita/2025080512345/artikel-hukum"
        ]
        
        for url in valid_urls:
            source_name = url.split('/')[2].replace('www.', '')
            with self.subTest(url=url):
                result = self.scraper._is_article_url(url, source_name)
                self.assertTrue(result, f"Should recognize {url} as article URL")
    
    def test_is_article_url_invalid_urls(self):
        """Test _is_article_url with invalid URLs"""
        # URLs that should NOT be recognized as articles
        invalid_urls = [
            "https://example.com/",  # Wrong domain
            "https://cnnindonesia.com/",  # Too short
            "https://different-site.com/article",  # Wrong domain
            ""  # Empty URL
        ]
        
        for url in invalid_urls:
            with self.subTest(url=url):
                result = self.scraper._is_article_url(url, "cnnindonesia.com")
                self.assertFalse(result, f"Should NOT recognize {url} as article URL")
    
    def test_contains_keywords_valid_combinations(self):
        """Test _contains_keywords with valid keyword combinations"""
        # Text that contains both bank + crime keywords
        valid_texts = [
            "Bank nasional terlibat kasus korupsi besar",
            "Perbankan syariah ditangkap karena fraud",
            "Bank BUMN tersangka pencucian uang",
            "Direktur bank divonis karena suap"
        ]
        
        for text in valid_texts:
            with self.subTest(text=text):
                result = self.scraper._contains_keywords(text)
                self.assertTrue(result, f"Text should match keywords: {text}")
    
    def test_contains_keywords_invalid_combinations(self):
        """Test _contains_keywords with invalid keyword combinations"""
        # Text that doesn't contain required keyword combinations
        invalid_texts = [
            "Bank nasional memberikan layanan terbaik",  # Bank but no crime
            "Tersangka korupsi ditangkap polisi",  # Crime but no bank
            "Kebakaran hutan meluas di Kalimantan",  # Neither bank nor crime
            "Pemilu legislatif akan segera dimulai",  # Political news
            ""  # Empty text
        ]
        
        for text in invalid_texts:
            with self.subTest(text=text):
                result = self.scraper._contains_keywords(text)
                self.assertFalse(result, f"Text should NOT match keywords: {text}")
    
    def test_contains_keywords_case_insensitive(self):
        """Test that _contains_keywords is case insensitive"""
        texts = [
            "BANK nasional terlibat KORUPSI",
            "Bank Nasional Terlibat Korupsi", 
            "bank nasional terlibat korupsi",
            "BaNk NaSiOnAl TeRlIbAt KoRuPsI"
        ]
        
        for text in texts:
            with self.subTest(text=text):
                result = self.scraper._contains_keywords(text)
                self.assertTrue(result, f"Case insensitive matching failed for: {text}")
    
    def test_parse_date_valid_formats(self):
        """Test _parse_date with various valid date formats"""
        valid_dates = [
            ("2025-08-05", "2025-08-05"),
            ("05/08/2025", "2025-08-05"),
            ("August 5, 2025", "2025-08-05"),
            ("5 Agustus 2025", "2025-08-05"),
            ("2025-08-05 14:30:00", "2025-08-05")
        ]
        
        for date_input, expected in valid_dates:
            with self.subTest(date_input=date_input):
                result = self.scraper._parse_date(date_input)
                self.assertEqual(result, expected)
    
    def test_parse_date_invalid_formats(self):
        """Test _parse_date with invalid date formats"""
        invalid_dates = [
            "",
            None,
            "invalid date",
            "32/13/2025",  # Invalid date
            "not a date at all"
        ]
        
        for date_input in invalid_dates:
            with self.subTest(date_input=date_input):
                result = self.scraper._parse_date(date_input)
                self.assertEqual(result, "")
    
    @patch('requests.Session.get')
    def test_extract_article_data_success(self, mock_get):
        """Test successful article data extraction"""
        # Mock successful HTTP response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = """
        <html>
            <head><title>Test Article</title></head>
            <body>
                <h1>Bank Nasional Terlibat Kasus Korupsi</h1>
                <div class="date">2025-08-05</div>
                <div class="detail-text">
                    Bank nasional tersangka dalam kasus korupsi besar.
                    Direktur bank ditangkap karena menerima suap.
                </div>
            </body>
        </html>
        """
        mock_get.return_value = mock_response
        
        source_config = {
            "title_selector": "h1",
            "content_selector": ".detail-text",
            "date_selector": ".date"
        }
        
        result = self.scraper.extract_article_data(
            "https://example.com/article",
            "example.com",
            source_config
        )
        
        self.assertIsNotNone(result)
        self.assertEqual(result['title'], "Bank Nasional Terlibat Kasus Korupsi")
        self.assertEqual(result['source_name'], "example.com")
        self.assertEqual(result['url'], "https://example.com/article")
        self.assertIn("Bank nasional tersangka", result['full_text'])
    
    @patch('requests.Session.get')
    def test_extract_article_data_keywords_not_matched(self, mock_get):
        """Test article extraction when keywords don't match"""
        # Mock response with content that doesn't match keywords
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = """
        <html>
            <body>
                <h1>Kebakaran Hutan di Kalimantan</h1>
                <div class="detail-text">
                    Kebakaran hutan semakin meluas di Kalimantan.
                    Asap tebal mengganggu penerbangan.
                </div>
            </body>
        </html>
        """
        mock_get.return_value = mock_response
        
        source_config = {
            "title_selector": "h1",
            "content_selector": ".detail-text", 
            "date_selector": ".date"
        }
        
        result = self.scraper.extract_article_data(
            "https://example.com/article",
            "example.com",
            source_config
        )
        
        # Should return None when keywords don't match
        self.assertIsNone(result)
    
    @patch('requests.Session.get')
    def test_extract_article_data_http_error(self, mock_get):
        """Test article extraction with HTTP error"""
        # Mock HTTP error
        mock_get.side_effect = requests.RequestException("Connection error")
        
        source_config = {
            "title_selector": "h1",
            "content_selector": ".content",
            "date_selector": ".date"
        }
        
        result = self.scraper.extract_article_data(
            "https://example.com/article",
            "example.com", 
            source_config
        )
        
        self.assertIsNone(result)
    
    @patch('requests.Session.get')
    def test_extract_article_data_404_error(self, mock_get):
        """Test article extraction with 404 error"""
        # Mock 404 response
        mock_response = Mock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response
        
        source_config = {
            "title_selector": "h1",
            "content_selector": ".content",
            "date_selector": ".date"
        }
        
        result = self.scraper.extract_article_data(
            "https://example.com/article",
            "example.com",
            source_config
        )
        
        self.assertIsNone(result)
    
    @patch('requests.Session.get')
    def test_extract_article_data_empty_content(self, mock_get):
        """Test article extraction with empty or minimal content"""
        # Mock response with minimal content
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = """
        <html>
            <body>
                <h1></h1>
                <div class="content"></div>
            </body>
        </html>
        """
        mock_get.return_value = mock_response
        
        source_config = {
            "title_selector": "h1",
            "content_selector": ".content",
            "date_selector": ".date"
        }
        
        result = self.scraper.extract_article_data(
            "https://example.com/article",
            "example.com",
            source_config
        )
        
        # Should return None for empty content
        self.assertIsNone(result)
    
    @patch('modules.scraper.NewsScraper._scrape_category_page')
    def test_scrape_articles_success(self, mock_scrape_category):
        """Test successful article scraping"""
        # Mock category page scraping to return test articles
        mock_articles = [
            {
                'title': 'Bank Korupsi Article 1',
                'url': 'https://example.com/1',
                'source_name': 'example.com',
                'full_text': 'Bank nasional tersangka korupsi'
            },
            {
                'title': 'Bank Fraud Article 2', 
                'url': 'https://example.com/2',
                'source_name': 'example.com',
                'full_text': 'Perbankan terlibat penipuan'
            }
        ]
        mock_scrape_category.return_value = mock_articles
        
        # Limit sources for testing
        self.scraper.sources = {
            "example.com": {
                "category_urls": ["https://example.com/category1"],
                "article_selector": "a",
                "title_selector": "h1",
                "content_selector": ".content",
                "date_selector": ".date"
            }
        }
        
        result = self.scraper.scrape_articles()
        
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]['title'], 'Bank Korupsi Article 1')
    
    @patch('modules.scraper.NewsScraper._scrape_category_page')
    def test_scrape_articles_no_results(self, mock_scrape_category):
        """Test scraping when no articles are found"""
        # Mock empty results
        mock_scrape_category.return_value = []
        
        self.scraper.sources = {
            "example.com": {
                "category_urls": ["https://example.com/category1"],
                "article_selector": "a",
                "title_selector": "h1", 
                "content_selector": ".content",
                "date_selector": ".date"
            }
        }
        
        result = self.scraper.scrape_articles()
        
        self.assertEqual(len(result), 0)
    
    @patch('requests.Session.get')
    def test_scrape_category_page_success(self, mock_get):
        """Test successful category page scraping"""
        # Mock category page with article links
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = """
        <html>
            <body>
                <a href="https://example.com/article1">Article 1</a>
                <a href="https://example.com/article2">Article 2</a>
                <a href="https://external.com/article">External Article</a>
            </body>
        </html>
        """
        mock_get.return_value = mock_response
        
        # Mock article extraction to return valid articles
        with patch.object(self.scraper, 'extract_article_data') as mock_extract:
            mock_extract.return_value = {
                'title': 'Test Article',
                'url': 'https://example.com/article1',
                'source_name': 'example.com',
                'full_text': 'Bank nasional tersangka korupsi'
            }
            
            source_config = {
                "article_selector": "a",
                "title_selector": "h1",
                "content_selector": ".content",
                "date_selector": ".date"
            }
            
            result = self.scraper._scrape_category_page(
                "example.com",
                source_config,
                "https://example.com/category"
            )
            
            # Should find articles from the correct domain
            self.assertGreater(len(result), 0)
    
    @patch('requests.Session.get')
    def test_scrape_category_page_http_error(self, mock_get):
        """Test category page scraping with HTTP error"""
        # Mock HTTP error
        mock_get.side_effect = requests.RequestException("Connection error")
        
        source_config = {
            "article_selector": "a",
            "title_selector": "h1",
            "content_selector": ".content", 
            "date_selector": ".date"
        }
        
        result = self.scraper._scrape_category_page(
            "example.com",
            source_config,
            "https://example.com/category"
        )
        
        self.assertEqual(len(result), 0)
    
    def test_source_configuration_completeness(self):
        """Test that all sources have complete configuration"""
        required_keys = [
            'category_urls',
            'article_selector', 
            'title_selector',
            'content_selector',
            'date_selector'
        ]
        
        for source_name, config in self.scraper.sources.items():
            with self.subTest(source=source_name):
                for key in required_keys:
                    self.assertIn(key, config, f"Source {source_name} missing {key}")
                
                # Test that category_urls is not empty
                self.assertGreater(
                    len(config['category_urls']), 0,
                    f"Source {source_name} has no category URLs"
                )
    
    def test_keyword_lists_not_empty(self):
        """Test that keyword lists are properly populated"""
        self.assertGreater(len(self.scraper.abu_keywords), 0, "ABU keywords list is empty")
        self.assertGreater(len(self.scraper.crime_keywords), 0, "Crime keywords list is empty")
        
        # Test for specific important keywords
        abu_keywords_lower = [kw.lower() for kw in self.scraper.abu_keywords]
        crime_keywords_lower = [kw.lower() for kw in self.scraper.crime_keywords]
        
        self.assertIn("bank", abu_keywords_lower)
        self.assertIn("perbankan", abu_keywords_lower)
        self.assertIn("korupsi", crime_keywords_lower)
        self.assertIn("fraud", crime_keywords_lower)
    
    def test_session_headers_configuration(self):
        """Test that HTTP session is properly configured"""
        headers = self.scraper.session.headers
        
        # Check for required headers
        self.assertIn('User-Agent', headers)
        self.assertIn('Accept', headers)
        self.assertIn('Accept-Language', headers)
        
        # Check that User-Agent looks realistic
        self.assertIn('Mozilla', headers['User-Agent'])
        self.assertIn('Chrome', headers['User-Agent'])
    
    @patch('modules.scraper.DataManager')
    def test_data_manager_initialization(self, mock_data_manager_class):
        """Test that DataManager is properly initialized"""
        # Create new scraper to test initialization
        scraper = NewsScraper()
        
        # Verify DataManager was instantiated
        mock_data_manager_class.assert_called_once()


if __name__ == '__main__':
    unittest.main(verbosity=2)
