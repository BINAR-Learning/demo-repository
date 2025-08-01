# Architecture: AML News Analysis Web App

## 1. Overview
A modular Python application for scraping, categorizing, and persisting financial crime news articles from Indonesian sources, with a simple UI for manual refresh and CSV output.

## 2. Main Components

### 2.1. News Scraper Module
 Handles scraping from multiple news sites (Detik, Tempo, CNNIndonesia, CNBCIndonesia)
- Extracts: title, full text, publication date, source URL, source name
- Filters by keywords
- Avoids duplicates (checks by URL)

### 2.2. AI/NLP Categorizer Module
- Uses spaCy or Hugging Face Transformers for text classification
- Assigns one primary category per article
- Categories: Money Laundering, Fraud, Gambling, Corruption, Tax Evasion, Other/Uncategorized

### 2.3. Data Persistence Module
- Stores all articles in a CSV file in `/output`
- Schema: title, url, source_name, publication_date, category, full_text
- Reads/writes for all analysis and reporting

### 2.4. User Interface (UI) Module
- Built with Streamlit or Gradio
- Provides a "Refresh" button to trigger scraping and update CSV
- Displays status messages

## 3. Data Flow
1. User clicks "GO" in UI
2. Scraper fetches and parses articles from sources
3. Articles filtered by keywords and deduplicated
4. Each article is categorized by the AI/NLP module
5. New articles are appended to the CSV file
6. UI displays update status

## 4. Directory Structure (Suggested)
```
final-project/
│   main.py
│   requirements.txt
│   run_app.bat
│   README.md
│
├── modules/
│   ├── __init__.py
│   ├── scraper.py
│   ├── categorizer.py
│   └── data_manager.py
│
├── output/
│   └── articles.csv
│   └── process_log_*.txt
│
├── docs/
│   ├── architecture.md
│   ├── implementation_task_lists.md
│   ├── prd.md
│   └── ...
│
├── test_ai_accuracy.py
├── test_categorizer.py
├── test_comprehensive.py
├── test_diagnostic.py
├── test_duplicates.py
├── test_enhanced.py
├── test_integration.py
├── test_scraper.py
└── __pycache__/
```

## 5. Main Flow Diagram

Below is a simple diagram showing the main data flow:

```
  [News Sites]
      |
      v
  [Scraper Module]
      |
      v
  [AI Categorizer]
      |
      v
  [Data Manager]
      |
      v
  [CSV Output]
      |
      v
  [Streamlit UI]
```

Or as ASCII art:

    +------------+      +-----------+      +---------------+      +-------------+      +-------------+
    | News Sites | ---> | Scraper   | ---> | AI Categorizer| ---> | DataManager | ---> | CSV Output  |
    +------------+      +-----------+      +---------------+      +-------------+      +-------------+
                                                                                                 |
                                                                                                 v
                                                                                          +-------------+
                                                                                          | Streamlit UI|
                                                                                          +-------------+
```

## 5. Technology Stack
- Python 3.x
- requests, beautifulsoup4, pandas
- spaCy or Hugging Face Transformers
- Streamlit or Gradio

## 6. Extensibility
- Future integration with SQLite and dashboard analytics
- Modular design for easy addition of new sources or categories
