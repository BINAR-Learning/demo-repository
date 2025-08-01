"""
Test script for AI Categorization Module
Tests automatic categorization of news articles
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from modules.categorizer import NewsCategorizor
from modules.data_manager import DataManager

def test_categorizer():
    """Test the NewsCategorizor functionality"""
    print("🧪 Testing AI Categorization Module")
    print("=" * 50)
    
    categorizer = NewsCategorizor()
    
    # Test articles with different categories (Indonesian language)
    test_articles = [
        {
            "title": "KPK Tangkap Pejabat Pajak Terkait Suap Rp 2 Miliar",
            "content": "Komisi Pemberantasan Korupsi (KPK) menangkap seorang pejabat Direktorat Jenderal Pajak karena menerima suap dalam pengurusan restitusi pajak senilai Rp 2 miliar. Pejabat tersebut diduga menerima gratifikasi dari wajib pajak.",
            "expected": "Corruption"
        },
        {
            "title": "Polda Metro Bongkar Sindikat Pencucian Uang Senilai Rp 50 Miliar",
            "content": "Polda Metro Jaya berhasil membongkar sindikat pencucian uang (money laundering) senilai Rp 50 miliar. Sindikat ini menggunakan berbagai metode layering melalui rekening bank dan investasi palsu untuk menyamarkan asal dana ilegal.",
            "expected": "Money Laundering"
        },
        {
            "title": "Investasi Bodong Rugikan Ribuan Nasabah",
            "content": "Skema investasi palsu atau investasi bodong yang menggunakan pola Ponzi berhasil menipu ribuan nasabah dengan kerugian mencapai Rp 100 miliar. Para penipu menjanjikan keuntungan tinggi dalam waktu singkat.",
            "expected": "Fraud"
        },
        {
            "title": "Polri Gerebek Situs Judi Online Terbesar",
            "content": "Kepolisian menggerebek jaringan judi online terbesar di Indonesia. Situs judi ini menyediakan berbagai permainan seperti togel, slot online, dan poker. Para bandar judi meraup keuntungan miliaran rupiah.",
            "expected": "Gambling"
        },
        {
            "title": "Dugaan Penggelapan Pajak Perusahaan Multinasional",
            "content": "Dirjen Pajak menyelidiki dugaan penggelapan pajak oleh perusahaan multinasional. Perusahaan tersebut diduga melakukan tax avoidance dan tidak melaporkan SPT dengan benar.",
            "expected": "Tax Evasion"
        },
        {
            "title": "Kebakaran Hutan di Kalimantan Meluas",
            "content": "Kebakaran hutan dan lahan di Kalimantan semakin meluas akibat musim kemarau panjang. Asap tebal mengganggu aktivitas penerbangan dan kesehatan masyarakat.",
            "expected": "Other/Uncategorized"
        }
    ]
    
    print("📝 Testing individual article categorization:")
    print()
    
    correct_predictions = 0
    total_tests = len(test_articles)
    
    for i, article in enumerate(test_articles, 1):
        predicted_category = categorizer.categorize_article(article["content"], article["title"])
        is_correct = predicted_category == article["expected"]
        
        status = "✅" if is_correct else "❌"
        print(f"{status} Test {i}: {article['title'][:60]}...")
        print(f"   Expected: {article['expected']}")
        print(f"   Predicted: {predicted_category}")
        print()
        
        if is_correct:
            correct_predictions += 1
    
    accuracy = (correct_predictions / total_tests) * 100
    print(f"📊 Categorization Results:")
    print(f"   Correct: {correct_predictions}/{total_tests}")
    print(f"   Accuracy: {accuracy:.1f}%")
    print()
    
    return accuracy >= 80  # 80% accuracy threshold

def test_data_manager_integration():
    """Test categorizer integration with data manager"""
    print("🔗 Testing Data Manager Integration")
    print("=" * 50)
    
    # Create test data manager
    data_manager = DataManager("test_output")
    
    # Test article without category (should be auto-categorized)
    test_article = {
        "title": "KPK Tahan Bupati Terkait Kasus Korupsi",
        "url": "https://test.com/korupsi-bupati-123",
        "source_name": "test.com",
        "publication_date": "2025-07-31",
        "full_text": "Komisi Pemberantasan Korupsi menahan seorang bupati karena dugaan korupsi dalam proyek infrastruktur. Bupati tersebut diduga menerima suap dari kontraktor."
    }
    
    print("💾 Testing auto-categorization during save...")
    success = data_manager.save_article(test_article)
    
    if success:
        print("✅ Article saved with auto-categorization")
        
        # Check the saved data
        stats = data_manager.get_statistics()
        print(f"📈 Current statistics: {stats}")
        
        # Clean up test file
        test_csv = os.path.join("test_output", "articles.csv")
        if os.path.exists(test_csv):
            os.remove(test_csv)
        if os.path.exists("test_output"):
            os.rmdir("test_output")
        
        return True
    else:
        print("❌ Failed to save article")
        return False

def test_keyword_management():
    """Test keyword management functionality"""
    print("🏷️  Testing Keyword Management")
    print("=" * 50)
    
    categorizer = NewsCategorizor()
    
    # Test adding new keywords
    new_keywords = ["financial crime", "kejahatan finansial"]
    success = categorizer.add_keywords("Money Laundering", new_keywords)
    
    if success:
        print("✅ Successfully added new keywords")
        
        # Test with the new keywords
        test_text = "Polisi menyelidiki kasus kejahatan finansial yang melibatkan beberapa bank"
        category = categorizer.categorize_article(test_text)
        
        print(f"📝 Test text: {test_text}")
        print(f"🏷️  Categorized as: {category}")
        
        return category == "Money Laundering"
    else:
        print("❌ Failed to add keywords")
        return False

def main():
    """Run all categorizer tests"""
    print("🚀 Starting AI Categorization Module Tests")
    print("=" * 60)
    print()
    
    tests_passed = 0
    total_tests = 3
    
    # Test 1: Basic categorization
    if test_categorizer():
        tests_passed += 1
        print("✅ Test 1 PASSED: Basic categorization")
    else:
        print("❌ Test 1 FAILED: Basic categorization")
    print()
    
    # Test 2: Data manager integration
    if test_data_manager_integration():
        tests_passed += 1
        print("✅ Test 2 PASSED: Data manager integration")
    else:
        print("❌ Test 2 FAILED: Data manager integration")
    print()
    
    # Test 3: Keyword management
    if test_keyword_management():
        tests_passed += 1
        print("✅ Test 3 PASSED: Keyword management")
    else:
        print("❌ Test 3 FAILED: Keyword management")
    print()
    
    # Final results
    print("=" * 60)
    print(f"🏁 FINAL RESULTS: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 ALL TESTS PASSED! AI Categorization Module is working correctly.")
        return True
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
