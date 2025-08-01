# AML News Analysis Web App

A web application that automates the collection, categorization, and analysis of financial crime-related news from key Indonesian sources.

## Features

- 🔍 Automated news scraping from Indonesian news websites
- 🤖 AI-powered categorization of articles
- 🖥️ Simple web interface built with Streamlit
- 📊 Real-time statistics and data visualization
- 💾 Dual file output: CSV data + detailed process logs
- 📥 CSV export functionality
- 🔄 Duplicate detection and prevention

## Quick Start

### Option 1: Double-click to run
Simply double-click `run_app.bat` to start the application.

### Option 2: Manual setup
1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   ```
   venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   streamlit run main.py
   ```

## How to Use

1. **Start the application** using one of the methods above
2. **Open your browser** to the URL shown (usually http://localhost:8501)
3. **Click the "GO" button** to start scraping news articles
4. **View statistics** and browse recent articles in the interface
5. **Download data** as CSV for further analysis

## Output Files

Each scraping session creates two files in the `/output` directory:
- `articles_YYYYMMDD_HHMMSS.csv` - Scraped articles data
- `process_log_YYYYMMDD_HHMMSS.txt` - Detailed processing log

## Project Structure

```
├── main.py              # Main Streamlit application
├── run_app.bat          # Quick start script
├── requirements.txt     # Python dependencies
├── modules/            # Application modules
│   ├── __init__.py
│   ├── scraper.py      # News scraping functionality
│   ├── categorizer.py  # AI categorization
│   └── data_manager.py # Data persistence & logging
├── output/             # CSV output files & logs
└── docs/               # Documentation
```


## Architecture & Data Flow

Below is a visual overview of the main data flow in the AML News Analysis Web App:

```
📰 News Sites
   │
   ▼
┌───────────────┐
│  Scraper      │  🔍
└───────────────┘
   │
   ▼
┌───────────────┐
│ AI Categorizer│  🤖
└───────────────┘
   │
   ▼
┌───────────────┐
│ Data Manager  │  💾
└───────────────┘
   │
   ▼
┌───────────────┐
│  CSV Output   │  📄
└───────────────┘
   │
   ▼
┌───────────────┐
│   UI (Web)    │  🖥️
└───────────────┘
```

Or as an ASCII art:

```
📰  ┌────────────┐      ┌──────────────┐      ┌───────────────┐      ┌──────────────┐      ┌────────────┐
    │ News Sites │ ───▶ │   Scraper    │ ───▶ │ AI Categorizer│ ───▶ │ Data Manager │ ───▶ │ CSV Output │
    └────────────┘      └──────────────┘      └───────────────┘      └──────────────┘      └────────────┘
                                                                                                   │
                                                                                                   ▼
                                                                                           ┌──────────────┐
                                                                                           │   UI (Web)   │
                                                                                           └──────────────┘
```

---


## Target News Sources

- Detik.com
- Tempo.co
- CNNIndonesia.com
- CNBCIndonesia.com

NB: Kompas.com was removed from the target sources due to robots.txt restrictions on automated scraping.

## Categories

- Money Laundering
- Fraud
- Gambling
- Corruption
- Tax Evasion
- Other/Uncategorized

## Scraping Keywords (Indonesian)

The following Indonesian keywords are used to filter and scrape financial crime-related news articles:

- pencucian uang (Money laundering)
- korupsi (Corruption)
- penipuan (Fraud/scam)
- judi online (Online gambling)
- suap (Bribery)
- penggelapan pajak (Tax evasion)
