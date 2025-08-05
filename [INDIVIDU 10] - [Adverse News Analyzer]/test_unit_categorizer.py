"""
Unit Tests for NewsCategorizor Module

This module contains comprehensive unit tests for the NewsCategorizor class,
testing categorization logic, keyword matching, and edge cases.

Author: AI Assistant
Date: August 5, 2025
Version: 1.0
"""

import unittest
import sys
import os
from unittest.mock import patch, MagicMock

# Add modules to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

# Import directly to avoid __init__.py issues
import modules.categorizer as categorizer_module
NewsCategorizor = categorizer_module.NewsCategorizor


class TestNewsCategorizor(unittest.TestCase):
    """Unit tests for NewsCategorizor class"""
    
    def setUp(self):
        """Set up test fixtures before each test method"""
        self.categorizer = NewsCategorizor()
    
    def test_initialization(self):
        """Test categorizer initialization"""
        # Test that categorizer initializes with correct categories
        expected_categories = [
            "Money Laundering",
            "Fraud", 
            "Gambling",
            "Corruption",
            "Tax Evasion",
            "Other/Uncategorized"
        ]
        self.assertEqual(self.categorizer.categories, expected_categories)
        
        # Test that keyword dictionaries are properly initialized
        self.assertIsInstance(self.categorizer.category_keywords, dict)
        self.assertEqual(len(self.categorizer.category_keywords), 5)  # Excluding "Other/Uncategorized"
        
        # Test that each category has keywords
        for category in expected_categories[:-1]:  # Excluding "Other/Uncategorized"
            self.assertIn(category, self.categorizer.category_keywords)
            self.assertIsInstance(self.categorizer.category_keywords[category], list)
            self.assertGreater(len(self.categorizer.category_keywords[category]), 0)
    
    def test_categorize_article_money_laundering(self):
        """Test categorization of money laundering articles"""
        # Test with clear money laundering content
        article_text = "Polda Metro Jaya berhasil membongkar sindikat pencucian uang senilai Rp 50 miliar. Sindikat ini menggunakan berbagai metode layering melalui rekening bank dan investasi palsu untuk menyamarkan asal dana ilegal."
        title = "Polda Metro Bongkar Sindikat Pencucian Uang Senilai Rp 50 Miliar"
        
        result = self.categorizer.categorize_article(article_text, title)
        self.assertEqual(result, "Money Laundering")
    
    def test_categorize_article_fraud(self):
        """Test categorization of fraud articles"""
        # Test with clear fraud content
        article_text = "Skema investasi palsu atau investasi bodong yang menggunakan pola Ponzi berhasil menipu ribuan nasabah dengan kerugian mencapai Rp 100 miliar. Para penipu menjanjikan keuntungan tinggi dalam waktu singkat."
        title = "Investasi Bodong Rugikan Ribuan Nasabah"
        
        result = self.categorizer.categorize_article(article_text, title)
        self.assertEqual(result, "Fraud")
    
    def test_categorize_article_gambling(self):
        """Test categorization of gambling articles"""
        # Test with clear gambling content
        article_text = "Kepolisian menggerebek jaringan judi online terbesar di Indonesia. Situs judi ini menyediakan berbagai permainan seperti togel, slot online, dan poker. Para bandar judi meraup keuntungan miliaran rupiah."
        title = "Polri Gerebek Situs Judi Online Terbesar"
        
        result = self.categorizer.categorize_article(article_text, title)
        self.assertEqual(result, "Gambling")
    
    def test_categorize_article_corruption(self):
        """Test categorization of corruption articles"""
        # Test with clear corruption content
        article_text = "Komisi Pemberantasan Korupsi (KPK) menangkap seorang pejabat Direktorat Jenderal Pajak karena menerima suap dalam pengurusan restitusi pajak senilai Rp 2 miliar. Pejabat tersebut diduga menerima gratifikasi dari wajib pajak."
        title = "KPK Tangkap Pejabat Pajak Terkait Suap Rp 2 Miliar"
        
        result = self.categorizer.categorize_article(article_text, title)
        self.assertEqual(result, "Corruption")
    
    def test_categorize_article_tax_evasion(self):
        """Test categorization of tax evasion articles"""
        # Test with clear tax evasion content
        article_text = "Dirjen Pajak menyelidiki dugaan penggelapan pajak oleh perusahaan multinasional. Perusahaan tersebut diduga melakukan tax avoidance dan tidak melaporkan SPT dengan benar."
        title = "Dugaan Penggelapan Pajak Perusahaan Multinasional"
        
        result = self.categorizer.categorize_article(article_text, title)
        self.assertEqual(result, "Tax Evasion")
    
    def test_categorize_article_other_uncategorized(self):
        """Test categorization of non-financial crime articles"""
        # Test with unrelated content
        article_text = "Kebakaran hutan dan lahan di Kalimantan semakin meluas akibat musim kemarau panjang. Asap tebal mengganggu aktivitas penerbangan dan kesehatan masyarakat."
        title = "Kebakaran Hutan di Kalimantan Meluas"
        
        result = self.categorizer.categorize_article(article_text, title)
        self.assertEqual(result, "Other/Uncategorized")
    
    def test_categorize_article_empty_content(self):
        """Test categorization with empty content"""
        result = self.categorizer.categorize_article("", "")
        self.assertEqual(result, "Other/Uncategorized")
        
        result = self.categorizer.categorize_article(None, None)
        self.assertEqual(result, "Other/Uncategorized")
    
    def test_categorize_article_title_weight(self):
        """Test that title keywords have higher weight than content keywords"""
        # Article with corruption keyword in title but fraud keyword in content
        title = "KPK menangkap tersangka korupsi"
        content = "Para penipu menggunakan modus investasi bodong untuk menipu korban"
        
        result = self.categorizer.categorize_article(content, title)
        # Should prioritize corruption due to title weight
        self.assertEqual(result, "Corruption")
    
    def test_categorize_article_case_insensitive(self):
        """Test that categorization is case insensitive"""
        # Test with mixed case
        article_text = "PENCUCIAN UANG senilai miliaran rupiah telah dibongkar polisi"
        title = "SINDIKAT Money Laundering DITANGKAP"
        
        result = self.categorizer.categorize_article(article_text, title)
        self.assertEqual(result, "Money Laundering")
    
    def test_categorize_article_multiple_keywords(self):
        """Test categorization when multiple keywords from same category appear"""
        # Multiple corruption keywords
        article_text = "KPK menangkap tersangka korupsi yang menerima suap dan gratifikasi dari kontraktor"
        title = "Tersangka Korupsi Ditangkap KPK"
        
        result = self.categorizer.categorize_article(article_text, title)
        self.assertEqual(result, "Corruption")
    
    def test_get_categories(self):
        """Test get_categories method"""
        categories = self.categorizer.get_categories()
        
        # Should return a copy, not the original list
        self.assertIsNot(categories, self.categorizer.categories)
        self.assertEqual(categories, self.categorizer.categories)
    
    def test_add_keywords_valid_category(self):
        """Test adding keywords to existing category"""
        initial_count = len(self.categorizer.category_keywords["Fraud"])
        new_keywords = ["scammer", "hoax", "fake investment"]
        
        result = self.categorizer.add_keywords("Fraud", new_keywords)
        
        self.assertTrue(result)
        self.assertEqual(
            len(self.categorizer.category_keywords["Fraud"]), 
            initial_count + len(new_keywords)
        )
        
        # Verify keywords were actually added
        for keyword in new_keywords:
            self.assertIn(keyword, self.categorizer.category_keywords["Fraud"])
    
    def test_add_keywords_invalid_category(self):
        """Test adding keywords to non-existent category"""
        result = self.categorizer.add_keywords("NonExistentCategory", ["keyword1", "keyword2"])
        self.assertFalse(result)
    
    def test_add_keywords_empty_list(self):
        """Test adding empty keyword list"""
        initial_count = len(self.categorizer.category_keywords["Fraud"])
        result = self.categorizer.add_keywords("Fraud", [])
        
        self.assertTrue(result)
        self.assertEqual(len(self.categorizer.category_keywords["Fraud"]), initial_count)
    
    def test_get_category_statistics_empty_list(self):
        """Test statistics with empty article list"""
        stats = self.categorizer.get_category_statistics([])
        
        # Should return all categories with zero counts
        for category in self.categorizer.categories:
            self.assertEqual(stats[category], 0)
    
    def test_get_category_statistics_valid_articles(self):
        """Test statistics with valid article data"""
        articles = [
            {"category": "Money Laundering"},
            {"category": "Fraud"},
            {"category": "Fraud"},
            {"category": "Corruption"},
            {"category": "Other/Uncategorized"}
        ]
        
        stats = self.categorizer.get_category_statistics(articles)
        
        self.assertEqual(stats["Money Laundering"], 1)
        self.assertEqual(stats["Fraud"], 2)
        self.assertEqual(stats["Gambling"], 0)
        self.assertEqual(stats["Corruption"], 1)
        self.assertEqual(stats["Tax Evasion"], 0)
        self.assertEqual(stats["Other/Uncategorized"], 1)
    
    def test_get_category_statistics_missing_category(self):
        """Test statistics with articles having missing or invalid categories"""
        articles = [
            {"category": "Money Laundering"},
            {"category": "InvalidCategory"},
            {},  # Missing category field
            {"category": "Fraud"}
        ]
        
        stats = self.categorizer.get_category_statistics(articles)
        
        self.assertEqual(stats["Money Laundering"], 1)
        self.assertEqual(stats["Fraud"], 1)
        self.assertEqual(stats["Other/Uncategorized"], 2)  # Invalid + missing categories
    
    @patch('modules.categorizer.logger')
    def test_categorize_article_exception_handling(self, mock_logger):
        """Test exception handling in categorize_article"""
        # Mock an exception in the categorization process
        with patch.object(self.categorizer, 'category_keywords', side_effect=Exception("Test error")):
            result = self.categorizer.categorize_article("test content", "test title")
            
            self.assertEqual(result, "Other/Uncategorized")
            mock_logger.error.assert_called_once()
    
    @patch('modules.categorizer.logger')
    def test_add_keywords_exception_handling(self, mock_logger):
        """Test exception handling in add_keywords"""
        # Mock an exception
        with patch.object(self.categorizer.category_keywords, '__getitem__', side_effect=Exception("Test error")):
            result = self.categorizer.add_keywords("Fraud", ["test"])
            
            self.assertFalse(result)
            mock_logger.error.assert_called_once()
    
    @patch('modules.categorizer.logger')
    def test_get_category_statistics_exception_handling(self, mock_logger):
        """Test exception handling in get_category_statistics"""
        # Pass invalid data type to trigger exception
        result = self.categorizer.get_category_statistics("invalid_data")
        
        self.assertEqual(result, {})
        mock_logger.error.assert_called_once()
    
    def test_keyword_patterns_completeness(self):
        """Test that all categories have reasonable keyword coverage"""
        # Each category should have at least 3 keywords
        for category, keywords in self.categorizer.category_keywords.items():
            self.assertGreaterEqual(
                len(keywords), 3, 
                f"Category '{category}' should have at least 3 keywords"
            )
    
    def test_indonesian_keyword_coverage(self):
        """Test that Indonesian keywords are properly included"""
        # Check for key Indonesian terms in each category
        corruption_keywords = [kw.lower() for kw in self.categorizer.category_keywords["Corruption"]]
        self.assertIn("korupsi", corruption_keywords)
        self.assertIn("suap", corruption_keywords)
        
        fraud_keywords = [kw.lower() for kw in self.categorizer.category_keywords["Fraud"]]
        self.assertIn("penipuan", fraud_keywords)
        
        gambling_keywords = [kw.lower() for kw in self.categorizer.category_keywords["Gambling"]]
        self.assertIn("judi", gambling_keywords)


if __name__ == '__main__':
    unittest.main(verbosity=2)
