# AML News Analysis Web App
# Main entry point for the application

"""
AML News Analysis Web Application

This is the main Streamlit application for the AML (Anti-Money Laundering) News Analysis system.
The application provides a web interface for:
- Scraping news articles from Indonesian sources with proportional progress tracking
- Categorizing articles using AI
- Viewing statistics and recent articles
- Downloading data as CSV
- Real-time progress updates with rotating informational messages

Author: AI Assistant
Date: August 1, 2025
Version: 1.1
"""

import streamlit as st
import pandas as pd
import os
from datetime import datetime
import sys

# Add modules to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

from modules.scraper import NewsScraper
from modules.data_manager import DataManager

def main():
    """
    Main Streamlit application function.
    
    Sets up the web interface with:
    - Page configuration and title
    - Session state management
    - GO button for triggering scraping with proportional progress
    - Statistics display
    - Recent articles table
    - CSV download functionality
    """
    # Configure Streamlit page settings
    st.set_page_config(
        page_title="AML News Analysis",
        page_icon="📰",
        layout="wide"
    )
    
    # Main page header
    st.title("🏦 AML News Analysis Web App")
    st.markdown("*Automated collection and categorization of financial crime news from Indonesian sources*")
    
    # Initialize session state variables for tracking application state
    if 'scraping_status' not in st.session_state:
        st.session_state.scraping_status = None
    if 'last_scrape_time' not in st.session_state:
        st.session_state.last_scrape_time = None
    
    # Create column layout for the main controls
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("### Data Collection")
        
        # GO Button - triggers the scraping process
        if st.button("🚀 GO", type="primary", use_container_width=True):
            # Start the scraping process with rotating messages
            run_scraping_with_messages()
    
    # Display current database statistics
    display_statistics()
    
    # Display table of recent articles
    display_recent_articles() 

def run_scraping_with_messages():
    """
    Execute the news scraping process with rotating loading messages and progress tracking.
    
    The progress bar reflects the actual scraping phases:
    - Initialization: 0-15%
    - Scraping process: 15-85% (with rotating status messages)
    - Final processing: 85-100%
    """
    import time
    
    # Define rotating messages
    loading_messages = [
        "🔄 Permintaanmu Sedang Diproses",
        "📋 Ikuti Prosedur yang Berlaku", 
        "🔍 Verifikasi Dulu, Aman Kemudian",
        "🛡️ Jauhi Fraud, Raih Berkah",
        "💰 Pahami Risiko, Cegah Pencucian Uang"
    ]
    
    # Create placeholders for messages and progress
    message_placeholder = st.empty()
    progress_bar = st.progress(0)
    
    # Initialize message rotation variables
    message_index = 0
    
    try:
        # Phase 1: Initialization (5% → 15%)
        message_placeholder.info(loading_messages[message_index])
        progress_bar.progress(5)
        time.sleep(1)
        
        scraper = NewsScraper()
        progress_bar.progress(15)
        
        # Phase 2: Scraping process (15% → 85% with granular steps and message rotation)
        all_articles = []
        data_manager = scraper.data_manager
        
        data_manager._log(f"🔍 Starting scrape session...")
        data_manager._log(f"📊 Current database: {data_manager.get_articles_count()} articles")
        
        total_sources = len(scraper.sources)
        processed_sources = 0
        
        # Process each source with progress updates and message rotation
        for source_name, source_config in scraper.sources.items():
            # Rotate message for each source
            message_index = (message_index + 1) % len(loading_messages)
            message_placeholder.info(f"{loading_messages[message_index]} - Scraping {source_name}...")
            
            data_manager._log(f"📰 Scraping from {source_name}...")
            
            # Process categories for this source
            for category_url in source_config["category_urls"]:
                try:
                    articles = scraper._scrape_category_page(source_name, source_config, category_url)
                    all_articles.extend(articles)
                    data_manager._log(f"   Found {len(articles)} relevant articles from {category_url}")
                    time.sleep(2)  # Respectful delay
                    
                except Exception as e:
                    data_manager._log(f"   ❌ Error scraping {category_url}: {str(e)}")
                    continue
            
            # Update progress based on sources completed with granular steps
            processed_sources += 1
            progress_ratio = processed_sources / total_sources
            
            # Map progress ratio to the defined steps (35%, 55%, 75%, 85%)
            if progress_ratio <= 0.25:
                current_progress = int(15 + (progress_ratio * 4) * 20)  # 15% to 35%
            elif progress_ratio <= 0.50:
                current_progress = int(35 + ((progress_ratio - 0.25) * 4) * 20)  # 35% to 55%
            elif progress_ratio <= 0.75:
                current_progress = int(55 + ((progress_ratio - 0.50) * 4) * 20)  # 55% to 75%
            else:
                current_progress = int(75 + ((progress_ratio - 0.75) * 4) * 10)  # 75% to 85%
            
            progress_bar.progress(min(current_progress, 85))
        
        # Phase 3: Final processing (85% → 90% → 100%)
        message_index = (message_index + 1) % len(loading_messages)
        message_placeholder.info(f"{loading_messages[message_index]} - Finalizing...")
        progress_bar.progress(90)
        
        # Save articles
        total_new = 0
        if all_articles:
            data_manager._log(f"💾 Saving articles to database...")
            total_new = data_manager.save_articles_batch(all_articles)
        
        data_manager._log(f"🏁 Scrape session complete!")
        data_manager._log(f"📊 Final Results:")
        data_manager._log(f"   - Articles found: {len(all_articles)}")
        data_manager._log(f"   - New articles saved: {total_new}")
        data_manager._log(f"   - Total in database: {data_manager.get_articles_count()}")
        
        # Complete progress
        progress_bar.progress(100)
        
        # Update session state
        st.session_state.scraping_status = "completed"
        st.session_state.last_scrape_time = datetime.now()
        
        # Display completion message
        if total_new > 0:
            message_placeholder.success(f"✅ Scraping completed! Found {total_new} new articles.")
        else:
            message_placeholder.info("ℹ️ Scraping completed. No new articles found.")
        
        # Clear progress bar after 2 seconds
        time.sleep(2)
        progress_bar.empty()
        
    except Exception as e:
        st.session_state.scraping_status = "error"
        progress_bar.empty()
        message_placeholder.error(f"❌ Error during scraping: {str(e)}")
        
        # Log the error for debugging
        print(f"Scraping error: {str(e)}")
        import traceback
        traceback.print_exc()

def display_statistics():
    """
    Display current database statistics in the Streamlit interface with enhanced formatting.
    
    Shows:
    - Total number of articles
    - Number of sources
    - Number of categories
    - Last update time
    - Breakdown by source and category in table format with larger fonts
    
    Handles errors gracefully if data cannot be loaded.
    """
    st.markdown("### 📊 Current Database Statistics")
    
    # Add custom CSS for larger fonts
    st.markdown("""
    <style>
    .metric-card {
        background-color: #f0f2f6;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        margin: 10px 0;
    }
    .metric-value {
        font-size: 32px;
        font-weight: bold;
        color: #1f77b4;
        margin-bottom: 5px;
    }
    .metric-label {
        font-size: 16px;
        color: #666;
        margin-bottom: 0;
    }
    .stats-table {
        font-size: 16px;
        margin: 20px 0;
    }
    .stats-table th {
        font-size: 18px;
        font-weight: bold;
        background-color: #1f77b4;
        color: white;
        padding: 12px;
    }
    .stats-table td {
        font-size: 16px;
        padding: 10px;
        border-bottom: 1px solid #ddd;
    }
    .stats-table tr:hover {
        background-color: #f5f5f5;
    }
    </style>
    """, unsafe_allow_html=True)
    
    try:
        # Get statistics from data manager
        data_manager = DataManager()
        stats = data_manager.get_statistics()
        
        # Create metrics columns for key statistics with enhanced styling
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value">{stats['total_articles']}</div>
                <div class="metric-label">Total Articles</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value">{len(stats['sources'])}</div>
                <div class="metric-label">Sources</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value">{len(stats['categories'])}</div>
                <div class="metric-label">Categories</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col4:
            # Show last scrape time from session state, or "Never" if no scraping done
            last_update = "Never"
            if st.session_state.last_scrape_time:
                last_update = st.session_state.last_scrape_time.strftime("%H:%M:%S")
            
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value" style="font-size: 20px;">{last_update}</div>
                <div class="metric-label">Last Updated</div>
            </div>
            """, unsafe_allow_html=True)
        
        # Show detailed breakdowns in table format if we have data
        if stats['total_articles'] > 0:
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown("#### 📰 Articles by Source")
                if stats['sources']:
                    # Create DataFrame for sources
                    sources_df = pd.DataFrame(list(stats['sources'].items()), 
                                            columns=['Source', 'Article Count'])
                    sources_df = sources_df.sort_values('Article Count', ascending=False)
                    
                    # Display as HTML table with custom styling
                    sources_table = sources_df.to_html(index=False, classes='stats-table', escape=False)
                    st.markdown(sources_table, unsafe_allow_html=True)
                else:
                    st.info("No source data available")
            
            with col2:
                st.markdown("#### 🏷️ Articles by Category")
                if stats['categories']:
                    # Create DataFrame for categories
                    categories_df = pd.DataFrame(list(stats['categories'].items()), 
                                               columns=['Category', 'Article Count'])
                    categories_df = categories_df.sort_values('Article Count', ascending=False)
                    
                    # Display as HTML table with custom styling
                    categories_table = categories_df.to_html(index=False, classes='stats-table', escape=False)
                    st.markdown(categories_table, unsafe_allow_html=True)
                else:
                    st.info("No category data available")
        
    except Exception as e:
        # Handle any errors in loading statistics
        st.error(f"Error loading statistics: {str(e)}")

def display_recent_articles():
    """
    Display a table of recent articles and provide CSV download functionality.
    
    Features:
    - Shows the 20 most recent articles sorted by publication date
    - Displays: Date, Clickable Title, Source, Category
    - Clickable titles that open article URLs in new tabs
    - Provides a download button for the complete dataset
    - Handles empty dataset gracefully
    - Uses proper date formatting for display
    
    The CSV download includes all articles with timestamp in filename.
    """
    st.markdown("### 📄 Recent Articles")
    
    try:
        # Load articles from data manager
        data_manager = DataManager()
        df = data_manager.load_articles()
        
        if len(df) > 0:
            # Sort by publication date (most recent first)
            df['publication_date'] = pd.to_datetime(df['publication_date'])
            df = df.sort_values('publication_date', ascending=False)
            
            # Get the top 20 articles
            recent_df = df.head(20).copy()
            
            # Format publication date for display
            recent_df['publication_date'] = recent_df['publication_date'].dt.strftime('%Y-%m-%d %H:%M')
            
            # Prepare display dataframe with selected columns
            display_df = recent_df[['publication_date', 'title', 'url', 'source_name', 'category']].copy()
            display_df.columns = ['Date', 'Title', 'URL', 'Source', 'Category']

            # Create a new column with clickable titles (showing only title text, not URL)
            display_df['Title'] = display_df.apply(
                lambda row: f"[{row['Title']}]({row['URL']})", axis=1
            )

            # Select columns for display (excluding the URL column since it's now embedded in Title)
            display_df = display_df[['Date', 'Title', 'Source', 'Category']]

            # Display as Markdown table with clickable links
            st.markdown('**Most Recent Articles:**')
            st.markdown(display_df.to_markdown(index=False), unsafe_allow_html=True)
            
            # CSV Export Section
            st.markdown("### 💾 Export Data")
            
            # Prepare CSV data for download (includes all articles, not just displayed ones)
            csv_data = df.to_csv(index=False)
            
            # Create download button with timestamped filename
            st.download_button(
                label="📥 Download Full Dataset (CSV)",
                data=csv_data,
                file_name=f"aml_news_articles_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                mime="text/csv"
            )
        else:
            # Show helpful message when no data is available
            st.info("📝 No articles found. Click the GO button to start scraping!")
            
    except Exception as e:
        # Handle any errors in loading or displaying articles
        st.error(f"Error loading articles: {str(e)}")

if __name__ == "__main__":
    # Entry point for the Streamlit application
    # Run with: streamlit run main.py
    main()
