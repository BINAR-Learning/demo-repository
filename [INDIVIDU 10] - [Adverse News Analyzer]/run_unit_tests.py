"""
Unit Test Runner for AML News Analysis System

This script runs all unit tests for the AML News Analysis system modules.
It provides a comprehensive test suite that validates the functionality
of all core components in isolation.

Usage:
    python run_unit_tests.py

Features:
- Runs all unit tests for categorizer, data_manager, and scraper modules
- Provides detailed test results and coverage information
- Handles test failures gracefully
- Generates test summary report

Author: AI Assistant
Date: August 5, 2025
Version: 1.0
"""

import unittest
import sys
import os
from io import StringIO

# Add modules to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

# Import test modules
from test_unit_categorizer import TestNewsCategorizor
from test_unit_data_manager import TestDataManager  
from test_unit_scraper import TestNewsScraper


def run_all_unit_tests():
    """Run all unit tests and generate comprehensive report"""
    
    print("🧪 AML News Analysis System - Unit Test Suite")
    print("=" * 60)
    print("Running comprehensive unit tests for all modules...")
    print()
    
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test cases from each module
    test_suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestNewsCategorizor))
    test_suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestDataManager))
    test_suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestNewsScraper))
    
    # Create test runner with high verbosity
    stream = StringIO()
    runner = unittest.TextTestRunner(
        stream=stream,
        verbosity=2,
        buffer=True,
        failfast=False
    )
    
    print("📋 Test Execution Summary:")
    print("-" * 40)
    
    # Run tests and capture results
    result = runner.run(test_suite)
    
    # Parse and display results
    output = stream.getvalue()
    
    # Count tests by module
    categorizer_tests = count_tests_in_output(output, "test_unit_categorizer")
    data_manager_tests = count_tests_in_output(output, "test_unit_data_manager") 
    scraper_tests = count_tests_in_output(output, "test_unit_scraper")
    
    # Display module-by-module results
    print(f"📰 NewsCategorizor Module:")
    print(f"   - Tests run: {categorizer_tests}")
    print(f"   - Status: {'✅ PASSED' if result.errors == [] and result.failures == [] else '❌ FAILED'}")
    
    print(f"💾 DataManager Module:")
    print(f"   - Tests run: {data_manager_tests}")
    print(f"   - Status: {'✅ PASSED' if result.errors == [] and result.failures == [] else '❌ FAILED'}")
    
    print(f"🔍 NewsScraper Module:")
    print(f"   - Tests run: {scraper_tests}")
    print(f"   - Status: {'✅ PASSED' if result.errors == [] and result.failures == [] else '❌ FAILED'}")
    
    print()
    print("📊 Overall Test Results:")
    print("-" * 30)
    print(f"Total tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    
    # Display detailed failure/error information if any
    if result.failures:
        print()
        print("❌ Test Failures:")
        print("-" * 20)
        for test, traceback in result.failures:
            print(f"FAIL: {test}")
            print(f"Traceback: {traceback[:200]}...")
            print()
    
    if result.errors:
        print()
        print("💥 Test Errors:")
        print("-" * 20)
        for test, traceback in result.errors:
            print(f"ERROR: {test}")
            print(f"Traceback: {traceback[:200]}...")
            print()
    
    # Final status
    print()
    if result.wasSuccessful():
        print("🎉 ALL UNIT TESTS PASSED!")
        print("✅ System modules are functioning correctly")
        print("🚀 Ready for integration testing and deployment")
    else:
        print("⚠️  SOME UNIT TESTS FAILED")
        print("🔧 Please review and fix the failing tests before proceeding")
        print("📝 Check the detailed error messages above")
    
    print()
    print("=" * 60)
    
    return result.wasSuccessful()


def count_tests_in_output(output, module_name):
    """Count number of tests run for a specific module"""
    lines = output.split('\n')
    count = 0
    for line in lines:
        if module_name in line and '(' in line and ')' in line:
            count += 1
    return count


def run_specific_module_tests(module_name):
    """Run tests for a specific module only"""
    
    print(f"🧪 Running Unit Tests for {module_name}")
    print("=" * 50)
    
    if module_name.lower() == 'categorizer':
        test_class = TestNewsCategorizor
    elif module_name.lower() == 'data_manager':
        test_class = TestDataManager
    elif module_name.lower() == 'scraper':
        test_class = TestNewsScraper
    else:
        print(f"❌ Unknown module: {module_name}")
        print("Available modules: categorizer, data_manager, scraper")
        return False
    
    # Create test suite for specific module
    test_suite = unittest.TestLoader().loadTestsFromTestCase(test_class)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Display results
    print()
    if result.wasSuccessful():
        print(f"✅ All {module_name} tests passed!")
    else:
        print(f"❌ Some {module_name} tests failed")
        print(f"Failures: {len(result.failures)}, Errors: {len(result.errors)}")
    
    return result.wasSuccessful()


if __name__ == '__main__':
    # Check command line arguments
    if len(sys.argv) > 1:
        module_name = sys.argv[1]
        success = run_specific_module_tests(module_name)
    else:
        success = run_all_unit_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)
