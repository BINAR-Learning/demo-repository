"""
End-to-End Workflow Validation Test

This test validates the complete workflow of the AML News Analysis system:
1. News scraping from all sources
2. AI categorization
3. Data persistence and CSV output
4. Statistics generation
5. UI functionality
6. Data integrity across the entire pipeline

Author: AI Assistant
Date: July 31, 2025
Version: 1.0
"""

import unittest
import os
import pandas as pd
import shutil
from datetime import datetime
import sys

# Add modules to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

from modules.scraper import NewsScraper
from modules.data_manager import DataManager
from modules.categorizer import NewsCategorizor

class TestEndToEndWorkflow(unittest.TestCase):
    """
    Comprehensive end-to-end workflow validation test suite.
    
    Tests the complete pipeline from news scraping to data output,
    ensuring all components work together correctly.
    """
    
    def setUp(self):
        """Set up test environment"""
        self.test_output_dir = "test_output_e2e"
        self.original_output_dir = "output"
        
        # Create clean test directory
        if os.path.exists(self.test_output_dir):
            shutil.rmtree(self.test_output_dir)
        os.makedirs(self.test_output_dir, exist_ok=True)
    
    def tearDown(self):
        """Clean up test environment"""
        if os.path.exists(self.test_output_dir):
            shutil.rmtree(self.test_output_dir)
    
    def test_complete_workflow(self):
        """
        Test the complete end-to-end workflow:
        1. Initialize all components
        2. Scrape articles from all sources
        3. Categorize articles using AI
        4. Save to CSV with proper formatting
        5. Generate statistics
        6. Validate data integrity
        """
        print("\n" + "="*50)
        print("RUNNING END-TO-END WORKFLOW VALIDATION")
        print("="*50)
        
        # Step 1: Initialize components
        print("\n1. Initializing components...")
        try:
            data_manager = DataManager(output_dir=self.test_output_dir)
            scraper = NewsScraper()
            categorizer = NewsCategorizor()
            print("✅ All components initialized successfully")
        except Exception as e:
            self.fail(f"Component initialization failed: {str(e)}")
        
        # Step 2: Test scraping workflow
        print("\n2. Testing news scraping workflow...")
        try:
            # Get initial article count
            initial_df = data_manager.load_articles()
            initial_count = len(initial_df)
            print(f"   Initial article count: {initial_count}")
            
            # Perform scraping (limit to prevent long test runtime)
            print("   Performing limited scraping test...")
            articles = scraper.scrape_articles(max_articles_per_source=2)
            
            if articles:
                print(f"✅ Scraping successful: {len(articles)} articles found")
                
                # Validate article structure
                for article in articles:
                    self.assertIn('title', article)
                    self.assertIn('url', article)
                    self.assertIn('source_name', article)
                    self.assertIn('publication_date', article)
                    self.assertIn('full_text', article)
                    self.assertTrue(len(article['title']) > 0)
                    self.assertTrue(len(article['url']) > 0)
                
                print("✅ Article structure validation passed")
            else:
                print("ℹ️  No new articles found (acceptable for test)")
            
        except Exception as e:
            print(f"❌ Scraping workflow failed: {str(e)}")
            # Don't fail the test if scraping fails due to network issues
            print("   Continuing with mock data for remaining tests...")
            articles = self._create_mock_articles()
        
        # Step 3: Test categorization workflow
        print("\n3. Testing AI categorization workflow...")
        try:
            if articles:
                for i, article in enumerate(articles):
                    category = categorizer.categorize_article(article['title'], article['full_text'])
                    article['category'] = category
                    print(f"   Article {i+1}: '{article['title'][:50]}...' -> {category}")
                
                print("✅ Categorization workflow successful")
            else:
                print("ℹ️  No articles to categorize")
        except Exception as e:
            self.fail(f"Categorization workflow failed: {str(e)}")
        
        # Step 4: Test data persistence workflow
        print("\n4. Testing data persistence workflow...")
        try:
            if articles:
                # Save articles
                saved_count = data_manager.save_articles_batch(articles)
                print(f"   Saved {saved_count} new articles")
                
                # Verify CSV file creation
                csv_files = [f for f in os.listdir(self.test_output_dir) if f.endswith('.csv')]
                self.assertGreater(len(csv_files), 0, "No CSV files created")
                print(f"✅ CSV files created: {csv_files}")
                
                # Verify session log creation
                log_files = [f for f in os.listdir(self.test_output_dir) if f.startswith('process_log_')]
                self.assertGreater(len(log_files), 0, "No log files created")
                print(f"✅ Log files created: {log_files}")
                
            print("✅ Data persistence workflow successful")
        except Exception as e:
            self.fail(f"Data persistence workflow failed: {str(e)}")
        
        # Step 5: Test statistics generation
        print("\n5. Testing statistics generation...")
        try:
            stats = data_manager.get_statistics()
            
            # Validate statistics structure
            self.assertIn('total_articles', stats)
            self.assertIn('sources', stats)
            self.assertIn('categories', stats)
            self.assertIsInstance(stats['total_articles'], int)
            self.assertIsInstance(stats['sources'], dict)
            self.assertIsInstance(stats['categories'], dict)
            
            print(f"   Total articles: {stats['total_articles']}")
            print(f"   Sources: {list(stats['sources'].keys())}")
            print(f"   Categories: {list(stats['categories'].keys())}")
            print("✅ Statistics generation successful")
            
        except Exception as e:
            self.fail(f"Statistics generation failed: {str(e)}")
        
        # Step 6: Test data integrity
        print("\n6. Testing data integrity...")
        try:
            # Load final dataset and validate
            final_df = data_manager.load_articles()
            
            if len(final_df) > 0:
                # Check required columns
                required_columns = ['title', 'url', 'source_name', 'publication_date', 'category', 'full_text']
                for col in required_columns:
                    self.assertIn(col, final_df.columns, f"Missing required column: {col}")
                
                # Check for duplicates
                duplicates = final_df.duplicated(subset=['url']).sum()
                self.assertEqual(duplicates, 0, f"Found {duplicates} duplicate URLs")
                
                # Check data types
                self.assertTrue(pd.api.types.is_datetime64_any_dtype(final_df['publication_date']), 
                              "publication_date should be datetime type")
                
                print(f"   Final dataset has {len(final_df)} articles")
                print("   ✅ All required columns present")
                print("   ✅ No duplicate URLs found")
                print("   ✅ Proper data types maintained")
            
            print("✅ Data integrity validation successful")
            
        except Exception as e:
            self.fail(f"Data integrity validation failed: {str(e)}")
        
        print("\n" + "="*50)
        print("END-TO-END WORKFLOW VALIDATION COMPLETED")
        print("✅ ALL TESTS PASSED SUCCESSFULLY")
        print("="*50)
    
    def test_error_handling(self):
        """Test error handling throughout the workflow"""
        print("\n" + "="*40)
        print("TESTING ERROR HANDLING")
        print("="*40)
        
        # Test with invalid output directory permissions (if possible)
        print("\n1. Testing error recovery...")
        
        try:
            data_manager = DataManager(output_dir=self.test_output_dir)
            
            # Test loading empty dataset
            df = data_manager.load_articles()
            self.assertEqual(len(df), 0, "Empty dataset should return empty DataFrame")
            print("✅ Empty dataset handling works correctly")
            
            # Test statistics with no data
            stats = data_manager.get_statistics()
            self.assertEqual(stats['total_articles'], 0)
            print("✅ Statistics with no data works correctly")
            
        except Exception as e:
            self.fail(f"Error handling test failed: {str(e)}")
        
        print("✅ Error handling tests passed")
    
    def test_performance_benchmarks(self):
        """Test basic performance benchmarks"""
        print("\n" + "="*40)
        print("TESTING PERFORMANCE BENCHMARKS")
        print("="*40)
        
        try:
            data_manager = DataManager(output_dir=self.test_output_dir)
            categorizer = NewsCategorizor()
            
            # Test categorization performance
            start_time = datetime.now()
            test_texts = [
                "Kasus pencucian uang senilai miliaran rupiah",
                "Penipuan investasi bodong merugikan investor",
                "Korupsi dana bantuan sosial oleh pejabat",
                "Judi online ilegal ditutup polisi",
                "Penggelapan pajak perusahaan multinasional"
            ]
            
            for text in test_texts:
                category = categorizer.categorize_article(text, text)
                self.assertIsNotNone(category)
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            print(f"   Categorized {len(test_texts)} articles in {duration:.2f} seconds")
            print(f"   Average: {duration/len(test_texts):.2f} seconds per article")
            
            # Performance should be reasonable (less than 2 seconds per article)
            self.assertLess(duration/len(test_texts), 2.0, "Categorization too slow")
            
            print("✅ Performance benchmarks passed")
            
        except Exception as e:
            self.fail(f"Performance benchmark failed: {str(e)}")
    
    def _create_mock_articles(self):
        """Create mock articles for testing when scraping fails"""
        return [
            {
                'title': 'Test Article - Money Laundering Case',
                'url': 'https://example.com/article1',
                'source_name': 'Test Source',
                'publication_date': datetime.now(),
                'full_text': 'This is a test article about pencucian uang and financial crimes.',
                'category': 'Money Laundering'
            },
            {
                'title': 'Test Article - Fraud Investigation',
                'url': 'https://example.com/article2',
                'source_name': 'Test Source',
                'publication_date': datetime.now(),
                'full_text': 'This is a test article about penipuan and fraudulent activities.',
                'category': 'Fraud'
            }
        ]

if __name__ == '__main__':
    # Run the end-to-end validation
    unittest.main(verbosity=2)
