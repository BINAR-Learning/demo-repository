#!/usr/bin/env python3
"""
Test script for the News Scraper
Tests the scraping functionality with a small sample
"""

import sys
import os

# Add the modules directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

from scraper import NewsScraper

def test_scraper():
    """Test the news scraper with a small sample"""
    print("🔧 Testing AML News Scraper...")
    print("=" * 50)
    
    # Initialize scraper
    scraper = NewsScraper()
    
    print(f"📰 Configured sources: {list(scraper.sources.keys())}")
    print(f"🔍 Target keywords: {scraper.keywords}")
    print()
    
    # Test with just one source and one category to be respectful
    print("🧪 Running limited test (1 source, 1 category)...")
    
    # Temporarily modify sources for testing
    original_sources = scraper.sources.copy()
    
    # Test with just CNN Indonesia - one category
    scraper.sources = {
        "cnnindonesia.com": {
            "category_urls": ["https://www.cnnindonesia.com/nasional/hukum-kriminal"],
            "article_selector": "a[href*='nasional'], a[href*='ekonomi']",
            "title_selector": "h1.title, h1",
            "content_selector": "div.detail-text, .content-text, .text-content", 
            "date_selector": "div.date, .date, time"
        }
    }
    
    try:
        articles = scraper.scrape_articles()
        
        print(f"\n✅ Test completed!")
        print(f"📊 Results:")
        print(f"   - Total articles found: {len(articles)}")
        
        if articles:
            print(f"\n📄 Sample article:")
            sample = articles[0]
            print(f"   - Title: {sample.get('title', 'N/A')[:100]}...")
            print(f"   - Source: {sample.get('source_name', 'N/A')}")
            print(f"   - URL: {sample.get('url', 'N/A')}")
            print(f"   - Date: {sample.get('publication_date', 'N/A')}")
            print(f"   - Content length: {len(sample.get('full_text', ''))} characters")
        
        # Restore original sources
        scraper.sources = original_sources
        
        return len(articles) > 0
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_scraper()
    if success:
        print("\n🎉 Scraper test passed!")
    else:
        print("\n🚨 Scraper test failed!")
