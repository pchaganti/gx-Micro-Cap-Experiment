# System Design Document: AI-Powered Trading Experiment

## 1. System Architecture
The system is designed with a **Human-in-the-Loop (HITL)** architecture. It consists of several decoupled components that rely on a human user to orchestrate the flow of information. This design prioritizes flexibility and transparency, allowing the user to intervene and understand every step of the process.

The high-level workflow is as follows:
1.  The **User** executes the **Trading Script**.
2.  The **Trading Script** reads the current portfolio state from **CSV Files**.
3.  The **Trading Script** fetches the latest market data.
4.  The **User** provides trade instructions to the **Trading Script** (based on previous LLM recommendations).
5.  The **Trading Script** processes the trades, updates the portfolio, and generates a daily report.
6.  The **User** copies the report and pastes it into an **LLM Interface** (e.g., ChatGPT).
7.  The **User** uses a set of structured **Prompts** to guide the LLM's analysis.
8.  The **LLM** provides trading recommendations.
9.  The **User** interprets these recommendations and the loop repeats from step 4 on the next day.

## 2. Component Design

### 2.1. Trading Script (`trading_script.py`)
This is the core engine of the system, responsible for all data processing and portfolio management.

*   **`main()` function:** The entry point of the script. It handles command-line argument parsing (`--file`, `--data-dir`, `--asof`) and orchestrates the main workflow.
*   **`load_latest_portfolio_state()`:** Reads the `chatgpt_portfolio_update.csv` file, finds the most recent date, and reconstructs the last known portfolio holdings and cash balance.
*   **`process_portfolio()`:** The main logic loop.
    *   It presents an interactive prompt to the user for entering manual buy/sell trades.
    *   It iterates through each holding in the portfolio.
    *   For each holding, it calls `download_price_data()` to get the latest OHLCV data.
    *   It checks for stop-loss breaches and executes sales if necessary by calling `log_sell()`.
    *   It updates the value of all holdings based on the closing price.
    *   It writes the updated daily results to the portfolio CSV.
*   **`download_price_data()`:** A robust data fetching function with a multi-stage fallback mechanism:
    1.  Tries to download data from Yahoo Finance using `yfinance`.
    2.  If that fails, it tries to download from Stooq using `pandas-datareader`.
    3.  If that fails, it tries a direct CSV download from Stooq.
    4.  If the ticker is a major index, it can use a pre-defined proxy (e.g., SPY for ^GSPC).
*   **`daily_results()`:** Generates the comprehensive report for the LLM. It calculates performance metrics (Sharpe, Sortino, etc.) and CAPM statistics (Alpha, Beta). The output is formatted for easy copying and pasting.
*   **Trade Logging Functions (`log_sell`, `log_manual_buy`, `log_manual_sell`):** These functions handle the logic for recording trades in `chatgpt_trade_log.csv` and updating the portfolio DataFrame.
*   **Date Utilities (`last_trading_date`, `check_weekend`):** Helper functions to ensure the script always operates on the correct trading day, even when run on weekends.

### 2.2. LLM Interaction (Prompts)
The "intelligence" of the system is guided by a set of carefully crafted prompts stored in `Experiment Details/Prompts.md`.

*   **Daily Prompt:** A template that is filled with the output of the `daily_results()` function. It asks the LLM for tactical decisions based on the provided data, with deep research explicitly forbidden.
*   **Deep Research Prompt:** A highly structured, multi-section prompt used for weekly strategy sessions. It forces the LLM to be systematic and provide detailed, actionable plans in a specific format.
*   **Conversation Starter Prompt:** A two-step prompt that forces the LLM to first demonstrate understanding of the current situation before making any recommendations. This mitigates the risk of hasty or uninformed suggestions.

### 2.3. Data Storage (CSV files)
The system uses two simple CSV files for data persistence.

*   **`chatgpt_portfolio_update.csv`:** Stores the daily snapshot of the portfolio. Each row represents a holding on a specific day, or a "TOTAL" row summarizing the portfolio's value.
*   **`chatgpt_trade_log.csv`:** An append-only log of all executed trades.

### 2.4. Graphing Script (`Generate_Graph.py`)
A separate utility for visualizing performance.

*   It reads the `chatgpt_portfolio_update.csv` file.
*   It uses `pandas` to process the data and `matplotlib` to generate a line chart.
*   The chart compares the portfolio's total equity over time to a normalized S&P 500 benchmark.
*   It accepts command-line arguments for customization (date range, initial equity).

## 3. Data Design

### 3.1. Data Models

**`chatgpt_portfolio_update.csv`**
| Column | Type | Description |
|---|---|---|
| Date | String | Date of the record (YYYY-MM-DD) |
| Ticker | String | Stock ticker or "TOTAL" |
| Shares | Float | Number of shares held |
| Cost Basis | Float | Total cost of the shares |
| Stop Loss | Float | The price at which to sell the stock |
| Current Price | Float | The closing price for the date |
| Total Value | Float | Current Price * Shares |
| PnL | Float | Profit or loss for the position |
| Action | String | The action taken (e.g., HOLD, SELL) |
| Cash Balance | Float | The amount of cash in the portfolio |
| Total Equity | Float | Total Value + Cash Balance |
| Buy Price | Float | The average price paid for the shares |

**`chatgpt_trade_log.csv`**
| Column | Type | Description |
|---|---|---|
| Date | String | Date of the trade (YYYY-MM-DD) |
| Ticker | String | Stock ticker |
| Shares Bought | Float | Number of shares bought |
| Buy Price | Float | Price per share for the buy |
| Cost Basis | Float | Total cost of the buy |
| PnL | Float | Profit or loss (for sells) |
| Reason | String | Reason for the trade (e.g., MANUAL, STOPLOSS) |
| Shares Sold | Float | Number of shares sold |
| Sell Price | Float | Price per share for the sell |

### 3.2. Data Flow Diagram

```
[User] -> Runs -> [trading_script.py]
    ^                   |
    |                   v
[LLM Interface] <- Reads <- [chatgpt_portfolio_update.csv]
    ^                   |
    |                   v
[Prompts] ----> [User]  -> Appends -> [chatgpt_trade_log.csv]
    |                   |
    v                   v
[LLM] <- Pastes Report - [User]
    |                   |
    v                   v
[Recommendations] -> [User] -> Enters Trades
```

## 4. Deployment and Operations
The system is designed to be run locally from a user's machine.

### 4.1. Setup
1.  Clone the repository from GitHub.
2.  Create a Python virtual environment.
3.  Install the required dependencies using `pip install -r requirements.txt`.

### 4.2. Daily Operation
1.  Open a terminal and activate the virtual environment.
2.  Run the trading script: `python trading_script.py --file "path/to/your/portfolio.csv"`.
3.  Follow the interactive prompts to enter trades based on the LLM's previous recommendations.
4.  Copy the entire report printed to the console.
5.  Paste the report into the LLM interface, using the appropriate prompt.
6.  Save the LLM's recommendations for the next day's run.

## 5. Technology Stack
*   **Language:** Python 3.7+
*   **Libraries:**
    *   `pandas`: For data manipulation and analysis.
    *   `yfinance`: For fetching data from Yahoo Finance.
    *   `pandas-datareader`: For fetching data from Stooq.
    *   `numpy`: For numerical operations.
    *   `matplotlib`: For generating performance graphs.
*   **AI Model:** ChatGPT-4 (or other capable LLM).
*   **Data Format:** CSV.
