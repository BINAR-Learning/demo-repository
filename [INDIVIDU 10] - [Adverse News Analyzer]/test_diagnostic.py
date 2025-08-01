#!/usr/bin/env python3
"""
Diagnostic test script for the News Scraper
Tests the scraping functionality with detailed output
"""

import sys
import os

# Add the modules directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

import requests
from bs4 import BeautifulSoup

def test_website_access():
    """Test basic website access and structure"""
    print("🔧 Diagnostic Test for AML News Scraper...")
    print("=" * 50)
    
    test_url = "https://www.cnnindonesia.com/nasional"
    
    try:
        print(f"🌐 Testing access to: {test_url}")
        
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        response = session.get(test_url, timeout=10)
        response.raise_for_status()
        
        print(f"✅ Successfully accessed website")
        print(f"📊 Response status: {response.status_code}")
        print(f"📄 Content length: {len(response.content)} bytes")
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Test different selectors
        selectors_to_test = [
            "article h3 a",
            ".media__title a", 
            "h3 a",
            "a[href*='/nasional/']",
            "a[href*='.html']"
        ]
        
        print(f"\n🔍 Testing CSS selectors:")
        for selector in selectors_to_test:
            links = soup.select(selector)
            print(f"   - '{selector}': {len(links)} links found")
            
            if links and len(links) > 0:
                # Show first few links
                for i, link in enumerate(links[:3]):
                    href = link.get('href', 'No href')
                    text = link.get_text(strip=True)[:50]
                    print(f"     [{i+1}] {text}... -> {href}")
        
        # Test for Indonesian keywords in page content
        page_text = soup.get_text().lower()
        keywords = ['pencucian uang', 'korupsi', 'penipuan', 'judi online', 'suap', 'penggelapan pajak']
        
        print(f"\n🔍 Checking for keywords in page content:")
        for keyword in keywords:
            found = keyword.lower() in page_text
            print(f"   - '{keyword}': {'✅ Found' if found else '❌ Not found'}")
        
        print(f"\n📄 Sample page content (first 300 chars):")
        print(f"   {soup.get_text()[:300]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    test_website_access()
