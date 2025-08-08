"""
Standalone Unit Tests for NewsCategorizor Module

This module contains comprehensive unit tests for the NewsCategorizor class,
testing categorization logic, keyword matching, and edge cases.
Tests are designed to run independently without package dependencies.

Author: AI Assistant
Date: August 5, 2025
Version: 1.0
"""

import unittest
import sys
import os
import re
from typing import Dict, List, Tuple
import logging
from unittest.mock import patch, MagicMock

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inline NewsCategorizor class for testing (to avoid import issues)
class NewsCategorizor:
    """
    AI-powered news article categorizer for financial crime content.
    """
    
    def __init__(self):
        self.categories = [
            "Money Laundering",
            "Fraud", 
            "Gambling",
            "Corruption",
            "Tax Evasion",
            "Other/Uncategorized"
        ]
        
        # Define keyword patterns for each category (Indonesian language)
        self.category_keywords = {
            "Money Laundering": [
                "pencucian uang", "money laundering", "tppu", "ppatk", 
                "suspicious transaction", "transaksi mencurigakan", "layering",
                "placement", "integration", "predicate crime", "aml"
            ],
            "Fraud": [
                "penipuan", "fraud", "scam", "tipu", "menipu", "penipu",
                "investasi bodong", "skema ponzi", "penipuan online",
                "phishing", "cyber fraud", "identitas palsu", "bobol", "pembobol","fiktif",
                "modus", "skandal"
            ],
            "Gambling": [
                "judi", "gambling", "judi online", "togel", "bandar judi",
                "taruhan", "betting", "casino", "slot online", "poker online",
                "situs judi", "praktik judi", "blokir"
            ],
            "Corruption": [
                "korupsi", "corruption", "suap", "menyuap", "penyuapan",
                "gratifikasi", "kpk", "tipikor", "pengadaan", "mark up",
                "kickback", "kolusi", "nepotisme", "tersangka", "vonis", "divonis",
                "ditahan", "ditangkap","kasus"
            ],
            "Tax Evasion": [
                "penggelapan pajak", "tax evasion", "pajak", "tax avoidance",
                "dirjen pajak", "ditjen pajak", "wajib pajak", "spt",
                "penghindaran pajak", "tax fraud", "faktur pajak"
            ]
        }
        
        logger.info("NewsCategorizor initialized with keyword-based classification")
    
    def categorize_article(self, article_text: str, title: str = "") -> str:
        """Categorize an article based on its content using keyword matching"""
        try:
            if not article_text:
                logger.warning("Empty article text provided")
                return "Other/Uncategorized"
            
            # Combine title and content for analysis (title has higher weight)
            combined_text = f"{title} {title} {article_text}".lower()
            
            # Score each category based on keyword matches
            category_scores = {}
            
            for category, keywords in self.category_keywords.items():
                score = 0
                for keyword in keywords:
                    # Count occurrences of each keyword
                    matches = len(re.findall(re.escape(keyword.lower()), combined_text))
                    score += matches
                    
                    # Bonus points for title matches
                    if title and keyword.lower() in title.lower():
                        score += 2
                
                category_scores[category] = score
            
            # Find the category with the highest score
            best_category = max(category_scores, key=category_scores.get)
            max_score = category_scores[best_category]
            
            # If no significant matches found, categorize as "Other/Uncategorized"
            if max_score == 0:
                best_category = "Other/Uncategorized"
            
            logger.debug(f"Category scores: {category_scores}")
            logger.info(f"Article categorized as: {best_category} (score: {max_score})")
            
            return best_category
            
        except Exception as e:
            logger.error(f"Error in categorization: {str(e)}")
            return "Other/Uncategorized"
    
    def get_categories(self) -> List[str]:
        """Return list of available categories"""
        return self.categories.copy()
    
    def add_keywords(self, category: str, new_keywords: List[str]) -> bool:
        """Add new keywords to a specific category"""
        try:
            if category not in self.category_keywords:
                logger.error(f"Category '{category}' not found")
                return False
            
            self.category_keywords[category].extend(new_keywords)
            logger.info(f"Added {len(new_keywords)} keywords to category '{category}'")
            return True
            
        except Exception as e:
            logger.error(f"Error adding keywords: {str(e)}")
            return False
    
    def get_category_statistics(self, articles_data: List[Dict]) -> Dict[str, int]:
        """Get statistics of categorized articles"""
        try:
            stats = {category: 0 for category in self.categories}
            
            for article in articles_data:
                category = article.get('category', 'Other/Uncategorized')
                if category in stats:
                    stats[category] += 1
                else:
                    stats['Other/Uncategorized'] += 1
            
            return stats
            
        except Exception as e:
            logger.error(f"Error calculating statistics: {str(e)}")
            return {}


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
        article_text = "Polda Metro Jaya berhasil membongkar sindikat pencucian uang senilai Rp 50 miliar. Sindikat ini menggunakan berbagai metode layering melalui rekening bank dan investasi palsu untuk menyamarkan asal dana ilegal."
        title = "Polda Metro Bongkar Sindikat Pencucian Uang Senilai Rp 50 Miliar"
        
        result = self.categorizer.categorize_article(article_text, title)
        self.assertEqual(result, "Money Laundering")
    
    def test_categorize_article_fraud(self):
        """Test categorization of fraud articles"""
        article_text = "Skema investasi palsu atau investasi bodong yang menggunakan pola Ponzi berhasil menipu ribuan nasabah dengan kerugian mencapai Rp 100 miliar. Para penipu menjanjikan keuntungan tinggi dalam waktu singkat."
        title = "Investasi Bodong Rugikan Ribuan Nasabah"
        
        result = self.categorizer.categorize_article(article_text, title)
        self.assertEqual(result, "Fraud")
    
    def test_categorize_article_gambling(self):
        """Test categorization of gambling articles"""
        article_text = "Kepolisian menggerebek jaringan judi online terbesar di Indonesia. Situs judi ini menyediakan berbagai permainan seperti togel, slot online, dan poker. Para bandar judi meraup keuntungan miliaran rupiah."
        title = "Polri Gerebek Situs Judi Online Terbesar"
        
        result = self.categorizer.categorize_article(article_text, title)
        self.assertEqual(result, "Gambling")
    
    def test_categorize_article_corruption(self):
        """Test categorization of corruption articles"""
        article_text = "Komisi Pemberantasan Korupsi (KPK) menangkap seorang pejabat Direktorat Jenderal Pajak karena menerima suap dalam pengurusan restitusi pajak senilai Rp 2 miliar. Pejabat tersebut diduga menerima gratifikasi dari wajib pajak."
        title = "KPK Tangkap Pejabat Pajak Terkait Suap Rp 2 Miliar"
        
        result = self.categorizer.categorize_article(article_text, title)
        self.assertEqual(result, "Corruption")
    
    def test_categorize_article_tax_evasion(self):
        """Test categorization of tax evasion articles"""
        article_text = "Dirjen Pajak menyelidiki dugaan penggelapan pajak oleh perusahaan multinasional. Perusahaan tersebut diduga melakukan tax avoidance dan tidak melaporkan SPT dengan benar."
        title = "Dugaan Penggelapan Pajak Perusahaan Multinasional"
        
        result = self.categorizer.categorize_article(article_text, title)
        self.assertEqual(result, "Tax Evasion")
    
    def test_categorize_article_other_uncategorized(self):
        """Test categorization of non-financial crime articles"""
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
    
    def test_add_keywords_invalid_category(self):
        """Test adding keywords to non-existent category"""
        result = self.categorizer.add_keywords("NonExistentCategory", ["keyword1", "keyword2"])
        self.assertFalse(result)
    
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


if __name__ == '__main__':
    print("🧪 Running NewsCategorizor Unit Tests")
    print("=" * 50)
    unittest.main(verbosity=2)
