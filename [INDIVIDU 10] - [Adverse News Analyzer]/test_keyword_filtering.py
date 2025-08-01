#!/usr/bin/env python3
"""
Test script to verify the new dual-condition keyword filtering system
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

from modules.scraper import NewsScraper

def test_keyword_filtering():
    """Test the new keyword filtering logic"""
    scraper = NewsScraper()
    
    # Test cases
    test_cases = [
        # Should match (has both ABU and crime keywords)
        ("Bank ABU terlibat dalam kasus korupsi", True),
        ("PT ABU diduga melakukan fraud", True), 
        ("ABU ditangkap karena modus penipuan", True),
        ("Tersangka dari Bank ABU divonis", True),
        ("PT ABU bobol rekening nasabah", True),
        
        # Should NOT match (missing ABU keywords)
        ("Bank BCA terlibat korupsi", False),
        ("Direktur ditangkap karena fraud", False),
        
        # Should NOT match (missing crime keywords)
        ("Bank ABU membuka cabang baru", False),
        ("PT ABU meluncurkan produk terbaru", False),
        
        # Should NOT match (neither condition met)
        ("Bank mandiri buka cabang", False),
        ("Ekonomi Indonesia tumbuh", False),
        
        # Edge cases - case insensitive
        ("BANK ABU terlibat KORUPSI", True),
        ("bank abu tersangka fraud", True),
        ("Pt Abu divonis dalam kasus", True),
    ]
    
    print("🧪 Testing keyword filtering system...")
    print("=" * 50)
    
    passed = 0
    failed = 0
    
    for text, expected in test_cases:
        result = scraper._contains_keywords(text)
        status = "✅ PASS" if result == expected else "❌ FAIL"
        
        print(f"{status} | Expected: {expected:5} | Got: {result:5} | Text: {text}")
        
        if result == expected:
            passed += 1
        else:
            failed += 1
    
    print("=" * 50)
    print(f"📊 Test Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 All tests passed! Keyword filtering is working correctly.")
    else:
        print("⚠️  Some tests failed. Please review the keyword logic.")
    
    return failed == 0

if __name__ == "__main__":
    test_keyword_filtering()
