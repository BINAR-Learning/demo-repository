#!/usr/bin/env python3
"""
Enhanced diagnostic test - checking actual article pages
"""

import sys
import os
import requests
from bs4 import BeautifulSoup
import time

def test_article_page_access():
    """Test accessing actual article pages to understand structure"""
    print("🔧 Enhanced Diagnostic Test - Article Page Structure...")
    print("=" * 60)
    
    # Let's try to find some actual article URLs
    base_urls = [
        "https://www.cnnindonesia.com/nasional/hukum-kriminal",
        "https://www.tempo.co/indeks/berita/hukum",
        "https://www.detik.com/news"
    ]
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })
    
    for base_url in base_urls:
        print(f"\n🌐 Testing: {base_url}")
        
        try:
            response = session.get(base_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Try to find article links with different patterns
            selectors = [
                "a[href*='nasional']",
                "a[href*='hukum']", 
                "a[href*='berita']",
                "a[href*='news']",
                "a",  # All links
            ]
            
            for selector in selectors:
                links = soup.select(selector)
                article_links = []
                
                for link in links:
                    href = link.get('href', '')
                    text = link.get_text(strip=True)
                    
                    # Filter for what looks like article links
                    if (href and 
                        len(text) > 20 and  # Reasonable title length
                        ('.html' in href or '/20' in href or len(href.split('/')) > 4) and
                        not any(skip in href.lower() for skip in ['javascript:', '#', 'mailto:', 'tel:'])):
                        article_links.append((text, href))
                
                if article_links:
                    print(f"   ✅ Selector '{selector}': Found {len(article_links)} potential articles")
                    
                    # Show first 3 articles
                    for i, (title, url) in enumerate(article_links[:3]):
                        print(f"      [{i+1}] {title[:60]}...")
                        print(f"          URL: {url}")
                    
                    # Test accessing one article
                    if article_links:
                        test_title, test_url = article_links[0]
                        
                        # Make URL absolute
                        if test_url.startswith('/'):
                            from urllib.parse import urlparse
                            parsed = urlparse(base_url)
                            test_url = f"{parsed.scheme}://{parsed.netloc}{test_url}"
                        
                        print(f"\n   🔍 Testing article access: {test_url[:50]}...")
                        
                        try:
                            article_response = session.get(test_url, timeout=10)
                            article_response.raise_for_status()
                            
                            article_soup = BeautifulSoup(article_response.content, 'html.parser')
                            article_text = article_soup.get_text().lower()
                            
                            # Check for keywords
                            keywords = ['pencucian uang', 'korupsi', 'penipuan', 'judi online', 'suap', 'penggelapan pajak']
                            found_keywords = [kw for kw in keywords if kw in article_text]
                            
                            print(f"      ✅ Article accessed successfully")
                            print(f"      📄 Content length: {len(article_text)} chars")
                            print(f"      🔍 Keywords found: {found_keywords if found_keywords else 'None'}")
                            
                        except Exception as e:
                            print(f"      ❌ Error accessing article: {str(e)}")
                    
                    break  # Found articles, no need to test other selectors
            
            time.sleep(2)  # Be respectful
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")

if __name__ == "__main__":
    test_article_page_access()
