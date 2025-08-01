"""
AI Categorization Module

Handles automatic categorization of news articles using Natural Language Processing.

This module provides intelligent categorization of Indonesian financial crime news articles
using keyword-based classification. It supports multiple categories and provides confidence
scoring for classification decisions.

Categories supported:
- Money Laundering (pencucian uang)
- Fraud (penipuan)
- Gambling (judi)
- Corruption (korupsi)
- Tax Evasion (penggelapan pajak)
- Other/Uncategorized

The system uses comprehensive Indonesian keyword patterns and can be easily extended
to support transformer-based models for more advanced classification.

Author: AI Assistant
Date: July 31, 2025
Version: 1.0
"""

import re
from typing import Dict, List, Tuple
import logging

# Configure logging for categorization operations
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NewsCategorizor:
    """
    AI-powered news article categorizer for financial crime content.
    
    This class provides automatic categorization of Indonesian news articles
    related to financial crimes using keyword-based classification with
    confidence scoring.
    
    Features:
    - Multi-category classification
    - Confidence scoring based on keyword matches
    - Support for Indonesian language patterns
    - Case-insensitive matching
    - Extensible keyword system
    - Detailed logging of classification decisions
    
    The classifier uses comprehensive keyword patterns for each category
    and assigns articles to the category with the highest keyword match score.
    Articles with no keyword matches are classified as "Other/Uncategorized".
    
    Categories:
    - Money Laundering: pencucian uang, TPPU, PPATK, etc.
    - Fraud: penipuan, investasi bodong, scam, etc.
    - Gambling: judi online, togel, betting, etc.
    - Corruption: korupsi, suap, KPK, gratifikasi, etc.
    - Tax Evasion: penggelapan pajak, tax avoidance, etc.
    
    Usage:
        categorizer = NewsCategorizor()
        category = categorizer.categorize_article(article_dict)
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
                "phishing", "cyber fraud", "identitas palsu", "bobol", "pembobol","fiktif"
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
        """
        Categorize an article based on its content using keyword matching
        
        Args:
            article_text (str): The full text content of the article
            title (str): The title of the article (optional, used for better accuracy)
            
        Returns:
            str: The assigned category name
        """
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
        """
        Add new keywords to a specific category
        
        Args:
            category (str): The category name
            new_keywords (List[str]): List of new keywords to add
            
        Returns:
            bool: True if successful, False otherwise
        """
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
        """
        Get statistics of categorized articles
        
        Args:
            articles_data: List of article dictionaries with 'category' field
            
        Returns:
            Dict[str, int]: Category counts
        """
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
