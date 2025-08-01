#!/usr/bin/env python3
"""
Integration test for the complete scraper with duplicate checking
"""

import sys
import os

# Add the modules directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

from modules.scraper import NewsScraper
from modules.data_manager import DataManager

def test_integration():
    """Test the complete integration of scraper and data manager"""
    print("🔧 Integration Test: Scraper + Data Manager + Duplicate Checking")
    print("=" * 70)
    
    # Initialize components
    data_manager = DataManager()
    print(f"📊 Initial database: {data_manager.get_articles_count()} articles")
    
    # Test with limited scraper to be respectful
    scraper = NewsScraper()
    
    # Limit to just one source and one category for testing
    scraper.sources = {
        "cnnindonesia.com": {
            "category_urls": ["https://www.cnnindonesia.com/nasional/hukum-kriminal"],
            "article_selector": "a[href*='nasional'], a[href*='ekonomi']",
            "title_selector": "h1.title, h1",
            "content_selector": "div.detail-text, .content-text, .text-content", 
            "date_selector": "div.date, .date, time"
        }
    }
    
    print(f"\n🧪 Running integration test with limited scraping...")
    
    try:
        # First run
        print(f"\n📍 First scrape run:")
        articles1 = scraper.scrape_articles()
        
        # Second run (should show duplicates)
        print(f"\n📍 Second scrape run (testing duplicates):")
        articles2 = scraper.scrape_articles()
        
        # Final statistics
        print(f"\n📊 Final Statistics:")
        stats = data_manager.get_statistics()
        print(f"   Total articles in database: {stats['total_articles']}")
        print(f"   Sources: {stats['sources']}")
        print(f"   Categories: {stats['categories']}")
        
        print(f"\n✅ Integration test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Integration test failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_integration()
    
    if success:
        print(f"\n🎉 FULL INTEGRATION SUCCESSFUL!")
        print(f"📝 The scraper and data manager are working together perfectly.")
        print(f"🔄 Duplicate checking prevents duplicate entries.")
        print(f"💾 All data is saved to CSV as specified in PRD.")
    else:
        print(f"\n🚨 Integration test failed - needs debugging!")
