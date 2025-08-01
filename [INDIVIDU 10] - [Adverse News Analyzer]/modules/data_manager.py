"""
Data Manager Module

Handles all data persistence operations for the AML News Analysis system.

This module provides:
- CSV-based data storage with duplicate prevention
- Session-specific logging and file management
- Article statistics and analytics
- AI-powered categorization integration
- Dual file output (main CSV + session-specific files)

The system maintains a main CSV file for all articles and creates
session-specific files for each scraping run with detailed logging.

Author: AI Assistant
Date: July 31, 2025
Version: 1.0
"""

import pandas as pd
import os
from datetime import datetime
from .categorizer import NewsCategorizor

class DataManager:
    """
    Manages data persistence and operations for news articles.
    
    This class handles:
    - CSV file operations with duplicate prevention
    - Session-specific logging and file management  
    - Article categorization using AI
    - Statistical analysis and reporting
    - Dual file output system (main + session files)
    
    Features:
    - Prevents duplicate articles based on URL
    - Maintains detailed session logs
    - Provides comprehensive statistics
    - Handles batch operations efficiently
    - Ensures data integrity and consistency
    
    Attributes:
        output_dir (str): Directory for output files
        csv_file (str): Path to main CSV file
        session_datetime (str): Timestamp for current session
        session_csv_file (str): Path to session-specific CSV
        session_log_file (str): Path to session log file
        csv_schema (list): Column names for CSV structure
        categorizer (NewsCategorizor): AI categorization instance
        log_messages (list): Session log message buffer
    """
    
    def __init__(self, output_dir="output"):
        self.output_dir = output_dir
        self.csv_file = os.path.join(output_dir, "articles.csv")
        
        # Generate datetime stamp for this session
        self.session_datetime = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.session_csv_file = os.path.join(output_dir, f"articles_{self.session_datetime}.csv")
        self.session_log_file = os.path.join(output_dir, f"process_log_{self.session_datetime}.txt")
        
        self.csv_schema = [
            "title",
            "url", 
            "source_name",
            "publication_date",
            "category",
            "full_text"
        ]
        
        # Initialize log for this session
        self.log_messages = []
        self._log(f"=== AML News Analysis Session Started ===")
        self._log(f"Session DateTime: {self.session_datetime}")
        self._log(f"Output CSV: articles_{self.session_datetime}.csv")
        self._log(f"Process Log: process_log_{self.session_datetime}.txt")
        
        # Initialize categorizer for automatic categorization
        self.categorizer = NewsCategorizor()
        self._log("AI Categorizer initialized")
        
        # Create output directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)
        self._log(f"Output directory ensured: {self.output_dir}")
        
        # Initialize CSV file if it doesn't exist
        if not os.path.exists(self.csv_file):
            self.initialize_csv()
    
    def _log(self, message):
        """Add message to session log"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        self.log_messages.append(log_entry)
        print(log_entry)  # Also print to console
    
    def save_session_log(self):
        """Save all logged messages to the session log file"""
        try:
            with open(self.session_log_file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(self.log_messages))
            self._log(f"Session log saved to: {self.session_log_file}")
            return True
        except Exception as e:
            print(f"❌ Error saving session log: {str(e)}")
            return False
    
    def save_article(self, article_data):
        """Save a single article to CSV with automatic categorization"""
        try:
            # Check if article already exists
            if self.check_duplicate(article_data.get('url', '')):
                self._log(f"🔄 Duplicate found, skipping: {article_data.get('title', 'Unknown')[:50]}...")
                return False
            
            # Auto-categorize the article if category is not provided or empty
            if not article_data.get('category') or article_data.get('category') == '':
                article_title = article_data.get('title', '')
                article_text = article_data.get('full_text', '')
                article_data['category'] = self.categorizer.categorize_article(article_text, article_title)
                self._log(f"🏷️  Auto-categorized as: {article_data['category']}")
            
            # Create DataFrame with single article
            df_new = pd.DataFrame([article_data])
            
            # Ensure all required columns are present
            for col in self.csv_schema:
                if col not in df_new.columns:
                    df_new[col] = ''
            
            # Reorder columns to match schema
            df_new = df_new[self.csv_schema]
            
            # Save to both main CSV and session CSV
            # Main CSV (append to existing)
            if os.path.exists(self.csv_file):
                df_new.to_csv(self.csv_file, mode='a', header=False, index=False, encoding='utf-8')
            else:
                df_new.to_csv(self.csv_file, mode='w', header=True, index=False, encoding='utf-8')
            
            # Session CSV (append to session-specific file)
            if os.path.exists(self.session_csv_file):
                df_new.to_csv(self.session_csv_file, mode='a', header=False, index=False, encoding='utf-8')
            else:
                df_new.to_csv(self.session_csv_file, mode='w', header=True, index=False, encoding='utf-8')
            
            self._log(f"✅ Saved: {article_data.get('title', 'Unknown')[:50]}...")
            return True
            
        except Exception as e:
            self._log(f"❌ Error saving article: {str(e)}")
            return False
    
    def save_articles_batch(self, articles_list):
        """Save multiple articles to CSV, checking for duplicates"""
        saved_count = 0
        duplicate_count = 0
        
        self._log(f"📦 Starting batch save of {len(articles_list)} articles")
        
        for article in articles_list:
            if self.save_article(article):
                saved_count += 1
            else:
                duplicate_count += 1
        
        self._log(f"📊 Batch save complete: {saved_count} new, {duplicate_count} duplicates")
        
        # Save session log after batch operation
        self.save_session_log()
        
        return saved_count
    
    def load_articles(self):
        """Load all articles from CSV"""
        try:
            if not os.path.exists(self.csv_file):
                print("📄 No existing articles file found.")
                return pd.DataFrame(columns=self.csv_schema)
            
            df = pd.read_csv(self.csv_file, encoding='utf-8')
            print(f"📊 Loaded {len(df)} existing articles from CSV")
            return df
            
        except Exception as e:
            print(f"❌ Error loading articles: {str(e)}")
            return pd.DataFrame(columns=self.csv_schema)
    
    def get_articles_count(self):
        """Get count of articles in the database"""
        try:
            if not os.path.exists(self.csv_file):
                return 0
            df = pd.read_csv(self.csv_file, encoding='utf-8')
            return len(df)
        except Exception as e:
            print(f"❌ Error counting articles: {str(e)}")
            return 0
    
    def check_duplicate(self, url):
        """Check if article URL already exists in the database"""
        try:
            if not url or not os.path.exists(self.csv_file):
                return False
            
            # Read only the URL column for efficiency
            df = pd.read_csv(self.csv_file, usecols=['url'], encoding='utf-8')
            
            # Check if URL exists (case-insensitive comparison)
            url_lower = url.lower().strip()
            existing_urls = df['url'].str.lower().str.strip()
            
            return url_lower in existing_urls.values
            
        except Exception as e:
            print(f"⚠️ Warning - error checking duplicates: {str(e)}")
            return False  # If error checking, allow saving to avoid data loss
    
    def get_duplicate_urls(self, urls_list):
        """Get list of URLs that already exist in database"""
        try:
            if not os.path.exists(self.csv_file):
                return []
            
            df = pd.read_csv(self.csv_file, usecols=['url'], encoding='utf-8')
            existing_urls = set(df['url'].str.lower().str.strip())
            
            duplicates = []
            for url in urls_list:
                if url and url.lower().strip() in existing_urls:
                    duplicates.append(url)
            
            return duplicates
            
        except Exception as e:
            print(f"⚠️ Warning - error checking duplicate URLs: {str(e)}")
            return []
    
    def initialize_csv(self):
        """Initialize CSV file with proper schema"""
        try:
            # Create empty DataFrame with schema
            df = pd.DataFrame(columns=self.csv_schema)
            df.to_csv(self.csv_file, index=False, encoding='utf-8')
            print(f"📄 Initialized new CSV file: {self.csv_file}")
            
        except Exception as e:
            print(f"❌ Error initializing CSV: {str(e)}")
    
    def get_statistics(self):
        """Get statistics about the stored articles"""
        try:
            if not os.path.exists(self.csv_file):
                return {
                    'total_articles': 0,
                    'sources': {},
                    'categories': {},
                    'date_range': None
                }
            
            df = pd.read_csv(self.csv_file, encoding='utf-8')
            
            # Count by source
            source_counts = df['source_name'].value_counts().to_dict() if 'source_name' in df.columns else {}
            
            # Count by category  
            category_counts = df['category'].value_counts().to_dict() if 'category' in df.columns else {}
            
            # Date range
            date_range = None
            if 'publication_date' in df.columns and len(df) > 0:
                try:
                    df['publication_date'] = pd.to_datetime(df['publication_date'])
                    min_date = df['publication_date'].min()
                    max_date = df['publication_date'].max()
                    date_range = f"{min_date.strftime('%Y-%m-%d')} to {max_date.strftime('%Y-%m-%d')}"
                except:
                    date_range = "Date parsing error"
            
            return {
                'total_articles': len(df),
                'sources': source_counts,
                'categories': category_counts,
                'date_range': date_range
            }
            
        except Exception as e:
            print(f"❌ Error getting statistics: {str(e)}")
            return {'total_articles': 0, 'sources': {}, 'categories': {}, 'date_range': None}
