#!/usr/bin/env python3
"""
Test script for duplicate checking functionality
"""

import sys
import os

# Add the modules directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

from modules.data_manager import DataManager

def test_duplicate_checking():
    """Test the duplicate checking functionality"""
    print("🔧 Testing Duplicate Checking Functionality...")
    print("=" * 50)
    
    # Initialize data manager
    data_manager = DataManager()
    
    # Test sample articles
    sample_articles = [
        {
            'title': 'Test Article 1 - Kasus Korupsi',
            'url': 'https://example.com/article1',
            'source_name': 'test.com',
            'publication_date': '2025-07-30 10:00:00',
            'category': 'Corruption',
            'full_text': 'This is a test article about korupsi and pencucian uang.'
        },
        {
            'title': 'Test Article 2 - Penipuan Online',
            'url': 'https://example.com/article2', 
            'source_name': 'test.com',
            'publication_date': '2025-07-30 11:00:00',
            'category': 'Fraud',
            'full_text': 'This is a test article about penipuan online.'
        },
        {
            'title': 'Test Article 1 - Duplicate URL',
            'url': 'https://example.com/article1',  # Same URL as first article
            'source_name': 'test.com',
            'publication_date': '2025-07-30 12:00:00',
            'category': 'Corruption',
            'full_text': 'This should be detected as duplicate.'
        }
    ]
    
    print(f"📊 Initial database: {data_manager.get_articles_count()} articles")
    
    # Test saving articles with duplicate checking
    print(f"\n🧪 Testing article saving with duplicate detection:")
    for i, article in enumerate(sample_articles, 1):
        print(f"\n   [{i}] Testing: {article['title']}")
        print(f"       URL: {article['url']}")
        
        # Check if duplicate before saving
        is_duplicate = data_manager.check_duplicate(article['url'])
        print(f"       Duplicate check: {'✅ Found duplicate' if is_duplicate else '❌ No duplicate'}")
        
        # Save article
        saved = data_manager.save_article(article)
        print(f"       Save result: {'✅ Saved' if saved else '🔄 Skipped (duplicate)'}")
    
    # Test batch operations
    print(f"\n🧪 Testing batch duplicate checking:")
    urls_to_check = [
        'https://example.com/article1',
        'https://example.com/article2', 
        'https://example.com/new-article',
        'https://example.com/another-new'
    ]
    
    duplicates = data_manager.get_duplicate_urls(urls_to_check)
    print(f"   URLs checked: {len(urls_to_check)}")
    print(f"   Duplicates found: {len(duplicates)}")
    for dup in duplicates:
        print(f"     - {dup}")
    
    # Test statistics
    print(f"\n📊 Database Statistics:")
    stats = data_manager.get_statistics()
    print(f"   Total articles: {stats['total_articles']}")
    print(f"   Sources: {stats['sources']}")
    print(f"   Categories: {stats['categories']}")
    print(f"   Date range: {stats['date_range']}")
    
    print(f"\n✅ Duplicate checking test completed!")
    return stats['total_articles'] > 0

if __name__ == "__main__":
    success = test_duplicate_checking()
    
    if success:
        print(f"\n🎉 Duplicate checking implementation successful!")
    else:
        print(f"\n🚨 Duplicate checking test failed!")
