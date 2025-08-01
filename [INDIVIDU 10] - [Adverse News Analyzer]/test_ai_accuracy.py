#!/usr/bin/env python3
"""
AI Categorization Accuracy Test
Tests the accuracy of the AI categorization module against known test cases
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

from modules.categorizer import NewsCategorizor

def test_ai_categorization_accuracy():
    """Test AI categorization with known test cases"""
    print("🧠 AI Categorization Accuracy Test")
    print("=" * 60)
    
    # Initialize categorizer
    categorizer = NewsCategorizor()
    
    # Test cases with expected categories
    test_cases = [
        {
            "title": "KPK Tangkap Pejabat dalam Kasus Suap Proyek Infrastruktur",
            "content": "Komisi Pemberantasan Korupsi menangkap seorang pejabat yang diduga menerima suap dalam tender proyek infrastruktur senilai miliaran rupiah.",
            "expected": "Corruption"
        },
        {
            "title": "Polisi Bongkar Sindikat Pencucian Uang Triliunan Rupiah",
            "content": "Kepolisian berhasil membongkar sindikat pencucian uang yang melibatkan transfer dana triliunan rupiah melalui berbagai bank.",
            "expected": "Money Laundering"
        },
        {
            "title": "Warga Terjerat Investasi Bodong Berkedok Crypto",
            "content": "Ratusan warga menjadi korban penipuan investasi cryptocurrency yang menjanjikan keuntungan fantastis namun ternyata skema ponzi.",
            "expected": "Fraud"
        },
        {
            "title": "Situs Judi Online Raup Keuntungan Miliaran dari Pelajar",
            "content": "Pihak berwajib menutup situs judi online yang meraup keuntungan miliaran rupiah dengan menargetkan para pelajar sebagai pemain utama.",
            "expected": "Gambling"
        },
        {
            "title": "Direktur Perusahaan Diduga Gelapkan Pajak Ratusan Miliar",
            "content": "Direktorat Jenderal Pajak menyidik dugaan penggelapan pajak oleh direktur perusahaan besar yang merugikan negara ratusan miliar rupiah.",
            "expected": "Tax Evasion"
        },
        {
            "title": "Bupati Tertangkap Tangan Terima Amplop dari Kontraktor",
            "content": "KPK menangkap tangan seorang bupati saat menerima amplop berisi uang dari kontraktor proyek pembangunan daerah.",
            "expected": "Corruption"
        },
        {
            "title": "Bank Sentral Temukan Skema Money Laundering di Sektor Perbankan",
            "content": "Bank Indonesia menemukan indikasi pencucian uang melalui transaksi mencurigakan di beberapa bank dengan nilai ratusan miliar.",
            "expected": "Money Laundering"
        },
        {
            "title": "Penipuan Berkedok Investasi Emas Rugikan Ribuan Nasabah",
            "content": "Ribuan nasabah menjadi korban penipuan investasi emas yang ternyata tidak memiliki izin resmi dari otoritas keuangan.",
            "expected": "Fraud"
        }
    ]
    
    correct_predictions = 0
    total_tests = len(test_cases)
    
    print(f"🧪 Testing {total_tests} categorization cases...\n")
    
    for i, test_case in enumerate(test_cases, 1):
        # Create test article
        test_article = {
            'title': test_case['title'],
            'full_text': test_case['content']
        }
        
        # Get predicted category
        predicted_category = categorizer.categorize_article(test_article)
        expected_category = test_case['expected']
        
        # Check if prediction is correct
        is_correct = predicted_category == expected_category
        if is_correct:
            correct_predictions += 1
            status = "✅ CORRECT"
        else:
            status = "❌ INCORRECT"
        
        print(f"Test {i:2d}: {status}")
        print(f"   Title: {test_case['title'][:60]}...")
        print(f"   Expected: {expected_category}")
        print(f"   Predicted: {predicted_category}")
        print()
    
    # Calculate accuracy
    accuracy = (correct_predictions / total_tests) * 100
    
    print("=" * 60)
    print("📊 AI CATEGORIZATION ACCURACY RESULTS")
    print("=" * 60)
    print(f"✅ Correct Predictions: {correct_predictions}/{total_tests}")
    print(f"📈 Accuracy Rate: {accuracy:.1f}%")
    
    if accuracy >= 75:
        print("🎉 AI categorization accuracy is EXCELLENT!")
        print("   The model performs well for production use.")
    elif accuracy >= 60:
        print("👍 AI categorization accuracy is GOOD.")
        print("   The model is acceptable for production use.")
    elif accuracy >= 40:
        print("⚠️  AI categorization accuracy is MODERATE.")
        print("   Consider improving the categorization logic.")
    else:
        print("🚨 AI categorization accuracy is POOR.")
        print("   The categorization logic needs significant improvement.")
    
    print()
    print("💡 Note: This test uses keyword-based categorization.")
    print("   For more advanced categorization, consider implementing")
    print("   transformer-based models like BERT or DistilBERT.")
    
    return accuracy >= 60  # Return True if accuracy is acceptable

def test_edge_cases():
    """Test edge cases for categorization"""
    print("\n🔍 Testing Edge Cases")
    print("=" * 30)
    
    categorizer = NewsCategorizor()
    
    edge_cases = [
        {
            "title": "Presiden Resmikan Jembatan Baru",
            "content": "Presiden meresmikan jembatan baru yang menghubungkan dua provinsi untuk meningkatkan konektivitas ekonomi.",
            "expected": "Other"
        },
        {
            "title": "Artikel Kosong",
            "content": "",
            "expected": "Other"
        },
        {
            "title": "",
            "content": "Konten tanpa judul ini membahas berbagai hal umum tanpa kata kunci spesifik.",
            "expected": "Other"
        }
    ]
    
    for i, test_case in enumerate(edge_cases, 1):
        test_article = {
            'title': test_case['title'],
            'full_text': test_case['content']
        }
        
        predicted_category = categorizer.categorize_article(test_article)
        expected_category = test_case['expected']
        
        is_correct = predicted_category == expected_category
        status = "✅ CORRECT" if is_correct else "❌ INCORRECT"
        
        print(f"Edge Case {i}: {status}")
        print(f"   Expected: {expected_category}, Got: {predicted_category}")

if __name__ == "__main__":
    print("🚀 Starting AI Categorization Accuracy Test...\n")
    
    try:
        # Run main accuracy test
        success = test_ai_categorization_accuracy()
        
        # Run edge case tests
        test_edge_cases()
        
        print("\n🏁 AI Categorization Testing Complete!")
        
        if success:
            print("✅ AI categorization system is ready for production!")
        else:
            print("⚠️  AI categorization system needs improvement before production.")
            
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        sys.exit(1)
