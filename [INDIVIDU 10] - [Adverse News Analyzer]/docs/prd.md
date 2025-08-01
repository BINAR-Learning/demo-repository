
# 1. Product Requirements Document: AML News Analysis Web App


| **Field**      | **Value**                                      |
|:---------------|:-----------------------------------------------|
| Document Title | AML News Analysis Web App – Product Requirements|
| Version        | 1.1                                            |
| Status         | Draft                                          |
| Author         | Gemini AI                                      |
| Date           | 29 July 2025                                   |


## 2. Introduction & Overview


### 2.1. Problem Statement
Financial crime compliance professionals, analysts, and researchers in Indonesia currently spend a significant amount of time manually searching various news websites to stay updated on money laundering, fraud, and other related illicit activities. This process is inefficient, prone to gaps, and makes it difficult to spot overarching trends.

### 2.2. Proposed Solution
This project is to develop a simple and effective web application that automates the collection, categorization, and analysis of financial crime-related news from key Indonesian sources. The application will provide a centralized dashboard to visualize trends and review relevant articles, saving users time and providing them with actionable insights.


## 3. Goals and Objectives


### 3.1. Automate Data Collection
Eliminate the need for manual searching by automatically scraping relevant news from a predefined list of sources.

### 3.2. Provide Centralized Insights
Offer a single dashboard where all relevant news is aggregated and organized.

### 3.3. Identify Key Trends
Enable users to easily visualize trends in financial crime reporting over time and across different categories.

### 3.4. Increase Efficiency
Significantly reduce the time required for market surveillance and research tasks.


## 4. Target Audience


### 4.1. Primary Users
- Compliance Analysts and AML Officers at financial institutions in Indonesia.

### 4.2. Secondary Users
- Financial crime researchers
- Investigative journalists
- Regulatory staff


## 5. Core Features & Requirements


### 5.1. News Scraping
The system must scrape news articles from a defined list of Indonesian news websites upon user request.

#### 5.1.1. Target Sources

The initial list of target websites will include:
- Detik.com
- Tempo.co
- CNNIndonesia.com
- CNBCIndonesia.com

> **Note:** Kompas.com was removed from the target sources due to robots.txt restrictions on automated scraping.

#### 5.1.2. Search Keywords
The scraper will search for articles containing keywords such as: "pencucian uang" (money laundering), "korupsi", "penipuan" (fraud), "judi online" (online gambling), "suap" (bribery), "penggelapan pajak" (tax evasion).

#### 5.1.3. Data Extraction
For each relevant article, the system must extract:
- Article Title
- Full Article Text (for analysis)
- Publication Date
- Source URL
- Source Name (e.g., "Detik.com")

#### 5.1.4. Manual Data Refresh
The scraping process (defined in 5.1.1 to 5.1.3) will be initiated when the user clicks a dedicated "GO" button in the web interface. The process must check the database to avoid adding duplicate articles based on the source URL.

### 5.2. AI-Powered Categorization
The system must use a Natural Language Processing (NLP) model to automatically categorize each new, unique article.

#### 5.2.1. Predefined Categories
The initial set of categories will be:
- Money Laundering
- Fraud
- Gambling
- Corruption
- Tax Evasion
- Other / Uncategorized

#### 5.2.2. Categorization Logic
The system will analyze the content of the article to assign it to the most relevant category before saving it to the database. An article can only belong to one primary category.


### 5.3. Data Persistence
The system must use a simple, file-based approach to store and manage all scraped articles for historical analysis.

#### 5.3.1. Output Format
All data compiled from sections 5.1 (News Scraping), 5.2 (AI Categorization), and 5.3 (Data Persistence) will be saved as a CSV file.

#### 5.3.2. Output Location
The CSV file will be generated in the `/output` folder of the project directory.

#### 5.3.3. CSV Schema
The CSV file will contain the following columns:
- title (Text)
- url (Text, UNIQUE)
- source_name (Text)
- publication_date (Date/Timestamp)
- category (Text)
- full_text (Text)

#### 5.3.4. Data Retrieval
All analysis and reporting will be based on the data in the generated CSV file.

### 5.4. Web Interface
The system includes a simple web-based user interface built with Streamlit that provides:

#### 5.4.1. Data Collection Interface
- A prominent "GO" button to initiate the news scraping process
- Real-time status updates during the scraping process
- Success/error notifications upon completion

#### 5.4.2. Data Visualization
- Current database statistics display (total articles, sources, categories)
- Breakdown of articles by source and category
- Recent articles table showing the latest 20 entries

#### 5.4.3. Data Export
- CSV download functionality for the complete dataset
- Timestamped file naming for data exports


## 6. Non-Functional Requirements


#### 6.1. Recommended Tech Stack
The application should be built using a simple, Python-based stack to facilitate rapid development.

##### 6.1.1. Web Framework
- Streamlit or Gradio

##### 6.1.2. Database
 - SQLite *(recommended for future extensibility; not required for Version 1.0, which uses only CSV output)*

##### 6.1.3. Data Handling
- Pandas

##### 6.1.4. Web Scraping
- Requests & Beautiful Soup

##### 6.1.5. AI/NLP
- spaCy or Hugging Face Transformers

#### 6.2. Performance
The dashboard should load within 5 seconds for a typical query (e.g., 6 months of data).

#### 6.3. Simplicity
The user interface must be intuitive and require no training to use.


## 7. Out of Scope (Future Considerations)


The following features will not be included in Version 1.0 but may be considered for future releases:
* User accounts and login functionality.  
* Real-time push notifications or email alerts.  
* Advanced search and filtering within the article text.  
* Named Entity Recognition (NER) to extract names of people, organizations, and locations.  
* Support for international news sources.  
* A publicly accessible API.


## 8. Success Metrics

### 8.1. Primary Metric

- **Reduction in average time spent by a target user on manual news monitoring**  
  - **Target:** >50% reduction

### 8.2. Secondary Metrics

- **Number of relevant articles successfully scraped and categorized per week**
- **Positive qualitative feedback from a sample group of test users**
- **Dashboard load time remains under the defined performance target**