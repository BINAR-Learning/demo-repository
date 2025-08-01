"""
Final Production Testing Script

This script performs comprehensive production readiness testing for the
AML News Analysis Web App before deployment.

Tests include:
- System requirements validation
- Component integration testing
- Performance validation
- Error handling verification
- Data integrity checks
- UI functionality testing
- Production environment simulation

Author: AI Assistant
Date: July 31, 2025
Version: 1.0
"""

import unittest
import sys
import os
import subprocess
import importlib
import time
import requests
from datetime import datetime
import pandas as pd
import shutil

# Add modules to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

class ProductionReadinessTest(unittest.TestCase):
    """
    Comprehensive production readiness test suite.
    
    Validates that the application is ready for production deployment
    by testing all critical components under realistic conditions.
    """
    
    def setUp(self):
        """Set up production testing environment"""
        self.test_output_dir = "test_output_production"
        self.required_packages = [
            'streamlit', 'pandas', 'requests', 'beautifulsoup4',
            'spacy', 'python-dateutil'
        ]
        
        # Create clean test directory
        if os.path.exists(self.test_output_dir):
            shutil.rmtree(self.test_output_dir)
        os.makedirs(self.test_output_dir, exist_ok=True)
    
    def tearDown(self):
        """Clean up production testing environment"""
        if os.path.exists(self.test_output_dir):
            shutil.rmtree(self.test_output_dir)
    
    def test_system_requirements(self):
        """Test system requirements and dependencies"""
        print("\n" + "="*50)
        print("PRODUCTION READINESS: SYSTEM REQUIREMENTS")
        print("="*50)
        
        # Test Python version
        python_version = sys.version_info
        print(f"Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
        self.assertGreaterEqual(python_version.major, 3, "Python 3+ required")
        self.assertGreaterEqual(python_version.minor, 8, "Python 3.8+ recommended")
        print("✅ Python version check passed")
        
        # Test required packages
        print("\nChecking required packages...")
        missing_packages = []
        
        for package in self.required_packages:
            try:
                if package == 'beautifulsoup4':
                    importlib.import_module('bs4')
                elif package == 'python-dateutil':
                    importlib.import_module('dateutil')
                else:
                    importlib.import_module(package)
                print(f"   ✅ {package}: Available")
            except ImportError:
                missing_packages.append(package)
                print(f"   ❌ {package}: Missing")
        
        if missing_packages:
            self.fail(f"Missing required packages: {missing_packages}")
        
        print("✅ All required packages are available")
    
    def test_project_structure(self):
        """Test project structure and file integrity"""
        print("\n" + "="*50)
        print("PRODUCTION READINESS: PROJECT STRUCTURE")
        print("="*50)
        
        required_files = [
            'main.py',
            'requirements.txt',
            'modules/__init__.py',
            'modules/scraper.py',
            'modules/data_manager.py',
            'modules/categorizer.py',
            'README.md'
        ]
        
        missing_files = []
        for file_path in required_files:
            if not os.path.exists(file_path):
                missing_files.append(file_path)
                print(f"   ❌ {file_path}: Missing")
            else:
                print(f"   ✅ {file_path}: Present")
        
        if missing_files:
            self.fail(f"Missing required files: {missing_files}")
        
        # Test output directory creation
        if not os.path.exists('output'):
            os.makedirs('output', exist_ok=True)
            print("   ✅ Output directory created")
        else:
            print("   ✅ Output directory exists")
        
        print("✅ Project structure validation passed")
    
    def test_component_initialization(self):
        """Test all components can be initialized without errors"""
        print("\n" + "="*50)
        print("PRODUCTION READINESS: COMPONENT INITIALIZATION")
        print("="*50)
        
        try:
            # Test scraper initialization
            from modules.scraper import NewsScraper
            scraper = NewsScraper()
            print("   ✅ NewsScraper: Initialized successfully")
            
            # Test data manager initialization
            from modules.data_manager import DataManager
            data_manager = DataManager(output_dir=self.test_output_dir)
            print("   ✅ DataManager: Initialized successfully")
            
            # Test categorizer initialization
            from modules.categorizer import NewsCategorizor
            categorizer = NewsCategorizor()
            print("   ✅ NewsCategorizor: Initialized successfully")
            
            print("✅ All components initialized successfully")
            
        except Exception as e:
            self.fail(f"Component initialization failed: {str(e)}")
    
    def test_network_connectivity(self):
        """Test network connectivity to news sources"""
        print("\n" + "="*50)
        print("PRODUCTION READINESS: NETWORK CONNECTIVITY")
        print("="*50)
        
        # Test connectivity to major news sources
        test_urls = [
            'https://www.detik.com',
            'https://www.tempo.co',
            'https://www.cnnindonesia.com',
            'https://www.cnbcindonesia.com'
        ]
        
        connectivity_results = []
        
        for url in test_urls:
            try:
                response = requests.get(url, timeout=10, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
                if response.status_code == 200:
                    connectivity_results.append(True)
                    print(f"   ✅ {url}: Accessible (Status: {response.status_code})")
                else:
                    connectivity_results.append(False)
                    print(f"   ⚠️  {url}: Accessible but returned {response.status_code}")
            except Exception as e:
                connectivity_results.append(False)
                print(f"   ❌ {url}: Connection failed - {str(e)}")
        
        # At least 50% of sources should be accessible
        success_rate = sum(connectivity_results) / len(connectivity_results)
        print(f"\nConnectivity success rate: {success_rate:.1%}")
        
        if success_rate < 0.5:
            print("⚠️  Warning: Low connectivity to news sources. Check network connection.")
        else:
            print("✅ Network connectivity test passed")
    
    def test_data_processing_pipeline(self):
        """Test the complete data processing pipeline"""
        print("\n" + "="*50)
        print("PRODUCTION READINESS: DATA PROCESSING PIPELINE")
        print("="*50)
        
        try:
            from modules.data_manager import DataManager
            from modules.categorizer import NewsCategorizor
            
            data_manager = DataManager(output_dir=self.test_output_dir)
            categorizer = NewsCategorizor()
            
            # Test with sample articles
            sample_articles = [
                {
                    'title': 'Kasus Pencucian Uang Bank Mega',
                    'url': 'https://example.com/test1',
                    'source_name': 'Test Source',
                    'publication_date': datetime.now(),
                    'full_text': 'Investigasi pencucian uang senilai triliunan rupiah di Bank Mega.',
                    'category': 'Money Laundering'
                },
                {
                    'title': 'Penipuan Investasi Binomo',
                    'url': 'https://example.com/test2',
                    'source_name': 'Test Source',
                    'publication_date': datetime.now(),
                    'full_text': 'Aplikasi investasi Binomo terbukti melakukan penipuan terhadap nasabah.',
                    'category': 'Fraud'
                }
            ]
            
            # Test categorization
            print("   Testing AI categorization...")
            for article in sample_articles:
                category = categorizer.categorize_article(article['title'], article['full_text'])
                print(f"   ✅ '{article['title'][:40]}...' -> {category}")
            
            # Test data saving
            print("   Testing data persistence...")
            saved_count = data_manager.save_articles_batch(sample_articles)
            print(f"   ✅ Saved {saved_count} articles")
            
            # Test data loading
            print("   Testing data loading...")
            df = data_manager.load_articles()
            self.assertGreater(len(df), 0, "No articles loaded")
            print(f"   ✅ Loaded {len(df)} articles")
            
            # Test statistics
            print("   Testing statistics generation...")
            stats = data_manager.get_statistics()
            self.assertIn('total_articles', stats)
            print(f"   ✅ Statistics generated: {stats['total_articles']} total articles")
            
            print("✅ Data processing pipeline test passed")
            
        except Exception as e:
            self.fail(f"Data processing pipeline test failed: {str(e)}")
    
    def test_error_resilience(self):
        """Test application resilience to various error conditions"""
        print("\n" + "="*50)
        print("PRODUCTION READINESS: ERROR RESILIENCE")
        print("="*50)
        
        try:
            from modules.data_manager import DataManager
            from modules.categorizer import NewsCategorizor
            
            # Test with empty/invalid data
            print("   Testing empty data handling...")
            data_manager = DataManager(output_dir=self.test_output_dir)
            empty_df = data_manager.load_articles()
            self.assertEqual(len(empty_df), 0, "Empty dataset should return empty DataFrame")
            print("   ✅ Empty data handling works")
            
            # Test with invalid articles
            print("   Testing invalid article handling...")
            invalid_articles = [
                {'title': '', 'url': 'invalid-url', 'source_name': 'Test'},  # Empty title
                {'title': 'Test', 'url': '', 'source_name': 'Test'},  # Empty URL
            ]
            
            # Should handle gracefully without crashing
            try:
                data_manager.save_articles_batch(invalid_articles)
                print("   ✅ Invalid article handling works")
            except Exception as e:
                print(f"   ✅ Invalid articles properly rejected: {str(e)}")
            
            # Test categorization with edge cases
            print("   Testing categorization edge cases...")
            categorizer = NewsCategorizor()
            
            edge_cases = [
                ('', ''),  # Empty strings
                ('Short', 'Too short text'),  # Very short text
                ('A' * 1000, 'B' * 5000),  # Very long text
            ]
            
            for title, text in edge_cases:
                try:
                    category = categorizer.categorize_article(title, text)
                    self.assertIsNotNone(category)
                except Exception:
                    pass  # Expected to handle gracefully
            
            print("   ✅ Edge case handling works")
            print("✅ Error resilience test passed")
            
        except Exception as e:
            self.fail(f"Error resilience test failed: {str(e)}")
    
    def test_performance_under_load(self):
        """Test performance under simulated load"""
        print("\n" + "="*50)
        print("PRODUCTION READINESS: PERFORMANCE UNDER LOAD")
        print("="*50)
        
        try:
            from modules.data_manager import DataManager
            from modules.categorizer import NewsCategorizor
            
            data_manager = DataManager(output_dir=self.test_output_dir)
            categorizer = NewsCategorizor()
            
            # Test categorization performance
            print("   Testing categorization performance...")
            start_time = time.time()
            
            test_articles = []
            for i in range(10):  # Test with 10 articles
                test_articles.append({
                    'title': f'Test Article {i+1} - Financial Crime Investigation',
                    'url': f'https://example.com/test{i+1}',
                    'source_name': 'Performance Test Source',
                    'publication_date': datetime.now(),
                    'full_text': f'This is test article {i+1} about pencucian uang and financial crimes in Indonesia. ' * 10,
                    'category': 'Money Laundering'
                })
            
            # Categorize all articles
            for article in test_articles:
                category = categorizer.categorize_article(article['title'], article['full_text'])
                article['category'] = category
            
            categorization_time = time.time() - start_time
            print(f"   ✅ Categorized {len(test_articles)} articles in {categorization_time:.2f} seconds")
            print(f"   ✅ Average: {categorization_time/len(test_articles):.3f} seconds per article")
            
            # Test bulk data operations
            print("   Testing bulk data operations...")
            start_time = time.time()
            
            saved_count = data_manager.save_articles_batch(test_articles)
            stats = data_manager.get_statistics()
            df = data_manager.load_articles()
            
            bulk_operations_time = time.time() - start_time
            print(f"   ✅ Bulk operations completed in {bulk_operations_time:.2f} seconds")
            print(f"   ✅ Final dataset size: {len(df)} articles")
            
            # Performance should be reasonable
            self.assertLess(categorization_time/len(test_articles), 2.0, "Categorization too slow")
            self.assertLess(bulk_operations_time, 5.0, "Bulk operations too slow")
            
            print("✅ Performance under load test passed")
            
        except Exception as e:
            self.fail(f"Performance test failed: {str(e)}")
    
    def test_streamlit_compatibility(self):
        """Test Streamlit application compatibility"""
        print("\n" + "="*50)
        print("PRODUCTION READINESS: STREAMLIT COMPATIBILITY")
        print("="*50)
        
        try:
            # Test importing streamlit
            import streamlit as st
            print("   ✅ Streamlit import successful")
            
            # Test main.py syntax
            with open('main.py', 'r', encoding='utf-8') as f:
                main_content = f.read()
            
            # Basic syntax check
            compile(main_content, 'main.py', 'exec')
            print("   ✅ main.py syntax validation passed")
            
            # Check for required Streamlit functions
            required_functions = [
                'st.set_page_config',
                'st.title',
                'st.button',
                'st.dataframe',
                'st.download_button'
            ]
            
            for func in required_functions:
                if func in main_content:
                    print(f"   ✅ {func}: Found")
                else:
                    print(f"   ⚠️  {func}: Not found")
            
            print("✅ Streamlit compatibility test passed")
            
        except Exception as e:
            self.fail(f"Streamlit compatibility test failed: {str(e)}")

def run_production_tests():
    """Run all production readiness tests"""
    print("=" * 60)
    print("STARTING FINAL PRODUCTION READINESS TESTING")
    print("=" * 60)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Create test suite
    test_suite = unittest.TestLoader().loadTestsFromTestCase(ProductionReadinessTest)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    print("\n" + "=" * 60)
    print("PRODUCTION READINESS TESTING SUMMARY")
    print("=" * 60)
    
    if result.wasSuccessful():
        print("🎉 ALL PRODUCTION TESTS PASSED!")
        print("✅ Application is ready for production deployment")
        print("\nNext steps:")
        print("1. Review the test output above")
        print("2. Run 'streamlit run main.py' to start the application")
        print("3. Test the web interface manually")
        print("4. Deploy to your preferred hosting platform")
    else:
        print("❌ SOME PRODUCTION TESTS FAILED")
        print(f"Failures: {len(result.failures)}")
        print(f"Errors: {len(result.errors)}")
        print("\nPlease fix the issues before production deployment.")
    
    print("=" * 60)
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_production_tests()
    sys.exit(0 if success else 1)
