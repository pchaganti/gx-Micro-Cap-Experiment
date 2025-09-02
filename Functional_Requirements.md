# Functional Requirements Document: AI-Powered Trading Experiment

## 1. Introduction

### 1.1. Purpose
This document specifies the functional requirements for an AI-Powered Trading Experiment system. The system is designed to allow a user to manage a stock portfolio based on the recommendations of a Large Language Model (LLM), such as ChatGPT.

### 1.2. Scope
The system shall provide functionalities for data fetching, portfolio management, trade execution simulation, performance analysis, and a structured interface for interacting with an LLM. The scope is limited to a human-in-the-loop system where the user manually transfers information between the software and the LLM.

### 1.3. Overview
The system is a command-line application that a user runs daily. It updates the user's portfolio, provides a detailed report, and allows the user to input trades. The user then takes the report to an LLM to get trading decisions and enters those decisions back into the system.

## 2. User Characteristics
The target users of this system are:
*   **Retail Investors:** Individuals interested in experimenting with algorithmic or AI-driven trading strategies.
*   **Data Scientists and AI Enthusiasts:** Individuals interested in the application of LLMs to financial markets.
*   **Beginners:** The system is designed to be accessible to users with basic knowledge of Python and stock trading.

## 3. Functional Requirements

### 3.1. Data Fetching and Management
*   **FR-3.1.1:** The system shall fetch daily Open, High, Low, Close, and Volume (OHLCV) data for specified stock tickers.
*   **FR-3.1.2:** The system shall use a primary data source (Yahoo Finance) and have a fallback mechanism to a secondary source (Stooq) if the primary source fails.
*   **FR-3.1.3:** The system shall be able to fetch data for a specified date range, including single-day requests.
*   **FR-3.1.4:** The system shall handle weekends and holidays by automatically identifying and using the last valid trading day's data.
*   **FR-3.1.5:** The system shall normalize data from different sources into a consistent format.
*   **FR-3.1.6:** The system shall support proxy tickers for major indices (e.g., fetching SPY data for a `^GSPC` request if necessary).

### 3.2. Portfolio Tracking and State Management
*   **FR-3.2.1:** The system shall maintain the state of the user's portfolio, including cash balance and all current holdings.
*   **FR-3.2.2:** For each holding, the system shall track the ticker, number of shares, average buy price, total cost basis, and a stop-loss level.
*   **FR-3.2.3:** The system shall load the latest portfolio state from a CSV file (`chatgpt_portfolio_update.csv`) at the start of each session.
*   **FR-3.2.4:** The system shall save the updated portfolio state to the same CSV file at the end of each session.
*   **FR-3.2.5:** The system shall handle an empty portfolio file by prompting the user for an initial cash balance.

### 3.3. Trade Execution and Logging
*   **FR-3.3.1:** The system shall provide an interactive command-line interface for the user to manually log buy and sell trades.
*   **FR-3.3.2:** The system shall support two order types for buys: Market-on-Open (MOO) and Limit.
*   **FR-3.3.3:** The system shall simulate the execution of limit orders based on the day's OHLC data.
*   **FR-3.3.4:** The system shall automatically execute a sell order for a position if its low price for the day breaches the specified stop-loss level.
*   **FR-3.3.5:** All executed trades (buys, sells, stop-loss triggers) shall be logged in a separate CSV file (`chatgpt_trade_log.csv`).
*   **FR-3.3.6:** The trade log shall record the date, ticker, action (buy/sell), number of shares, execution price, cost basis, PnL (for sells), and a reason for the trade.
*   **FR-3.3.7:** The system shall update the portfolio's cash balance and holdings after each trade.

### 3.4. Performance Analysis and Reporting
*   **FR-3.4.1:** The system shall generate a daily report that can be copied and pasted into an LLM.
*   **FR-3.4.2:** The daily report shall include:
    *   Price and volume data for all portfolio holdings and benchmark tickers.
    *   A snapshot of the current portfolio holdings.
    *   The current cash balance and total equity.
    *   Key performance metrics: Max Drawdown, Sharpe Ratio (period and annualized), and Sortino Ratio (period and annualized).
    *   CAPM analysis against a benchmark (^GSPC), including Beta, annualized Alpha, and R-squared.
    *   A comparison of the portfolio's equity to an equivalent initial investment in the S&P 500.
*   **FR-3.4.3:** The system shall provide clear instructions within the report for the LLM.

### 3.5. AI-Driven Decision Making (Interaction with LLM)
*   **FR-3.5.1:** The system shall rely on the user to manually transfer the daily report to an LLM.
*   **FR-3.5.2:** The system shall rely on the user to manually interpret the LLM's recommendations and enter them as trades into the system.
*   **FR-3.5.3:** The project shall provide a set of recommended prompts for the user to interact with the LLM, covering daily tactical decisions and weekly deep research sessions.

### 3.6. User Interaction and Workflow
*   **FR-3.6.1:** The system shall be a command-line application run via a Python script.
*   **FR-3.6.2:** The system shall support command-line arguments to specify the portfolio file path and an "as-of" date for backtesting.
*   **FR-3.6.3:** The system shall guide the user through the daily workflow with clear prompts and instructions.

### 3.7. Configuration
*   **FR-3.7.1:** The system shall allow the user to configure the list of benchmark tickers via a `tickers.json` file.

### 3.8. Visualization
*   **FR-3.8.1:** A separate script (`Generate_Graph.py`) shall be provided to generate a graphical visualization of the portfolio's performance.
*   **FR-3.8.2:** The graph shall compare the portfolio's equity over time against a benchmark (S&P 500).
*   **FR-3.8.3:** The graphing script shall allow the user to specify a date range and an initial equity amount for normalization.

## 4. Non-Functional Requirements

### 4.1. Performance
*   **NFR-4.1.1:** The system should fetch market data for a small number of tickers (e.g., <20) in a timely manner (e.g., within a few seconds).
*   **NFR-4.1.2:** The daily processing and report generation should be completed within a reasonable time (e.g., under 30 seconds).

### 4.2. Reliability
*   **NFR-4.2.1:** The system's data fetching should be resilient to failures in the primary data source.
*   **NFR-4.2.2:** The system should handle missing or invalid data gracefully, providing informative messages to the user.

### 4.3. Usability
*   **NFR-4.3.1:** The command-line interface should be clear and easy to understand for users with basic technical skills.
*   **NFR-4.3.2:** The setup and installation process should be well-documented and straightforward.
*   **NFR-4.3.3:** The output reports should be well-formatted and easy to read.

### 4.4. Maintainability
*   **NFR-4.4.1:** The code should be well-structured and commented to facilitate understanding and future modifications.
*   **NFR-4.4.2:** The system should have a clear separation of concerns (e.g., data fetching, portfolio logic, reporting).
