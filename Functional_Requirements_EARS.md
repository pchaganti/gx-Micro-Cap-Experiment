# Functional Requirements (EARS Format)

This document specifies the functional requirements for the AI-Powered Trading Experiment system using the EARS (Easy Approach to Requirements Syntax).

## 1. System-Wide Requirements (Ubiquitous)
*   **EARS-U1:** The system shall maintain the state of the user's portfolio, including cash balance and all current holdings.
*   **EARS-U2:** The system shall be a command-line application run via a Python script.

## 2. Data Fetching and Management (Event-Driven)
*   **EARS-E1:** When the script requires price data for a ticker, the system shall fetch daily Open, High, Low, Close, and Volume (OHLCV) data.
*   **EARS-E2:** If the primary data source (Yahoo Finance) fails, then the system shall attempt to fetch the data from a secondary source (Stooq).
*   **EARS-E3:** If the primary and secondary sources fail for a major index, then the system shall attempt to fetch data for a pre-defined proxy ticker.
*   **EARS-E4:** When fetching data, the system shall normalize it into a consistent format.

## 3. Portfolio and Session Management (State-Driven & Event-Driven)
*   **EARS-E5:** At the start of a session, the system shall load the latest portfolio state from `chatgpt_portfolio_update.csv`.
*   **EARS-E6:** If the portfolio CSV file is empty at the start of a session, then the system shall prompt the user for an initial cash balance.
*   **EARS-S1:** While a session is active, the system shall track the ticker, number of shares, average buy price, total cost basis, and a stop-loss level for each holding.
*   **EARS-E7:** At the end of a session, the system shall save the updated portfolio state to `chatgpt_portfolio_update.csv`.
*   **EARS-E8:** When a trade is executed, the system shall log the trade details to `chatgpt_trade_log.csv`.
*   **EARS-E9:** When a trade is executed, the system shall update the portfolio's cash balance and holdings accordingly.

## 4. Trading and Execution (Event-Driven & State-Driven)
*   **EARS-S2:** While the system is in the interactive trade entry phase, the user shall be able to log manual buy and sell trades.
*   **EARS-E10:** If the user chooses to log a buy, then the system shall allow them to select either a Market-on-Open (MOO) or Limit order type.
*   **EARS-E11:** If a limit order's price is met by the day's OHLC data, then the system shall simulate the execution of that order.
*   **EARS-E12:** If a position's low price for the day breaches its specified stop-loss level, then the system shall automatically execute a sell order for that position.

## 5. Reporting and Analysis (Event-Driven)
*   **EARS-E13:** After all portfolio processing is complete, the system shall generate a daily report.
*   **EARS-E14:** When the daily report is generated, it shall include:
    *   Price and volume data for holdings and benchmarks.
    *   A snapshot of the current portfolio.
    *   Cash balance and total equity.
    *   Performance metrics (Max Drawdown, Sharpe Ratio, Sortino Ratio).
    *   CAPM analysis (Beta, Alpha, R-squared).
    *   A comparison to a benchmark investment.
    *   Instructions for the LLM.

## 6. Optional Features (Conditional)
*   **EARS-O1:** Where the user provides an `--asof` command-line argument, the system shall run the simulation for the specified historical date.
*   **EARS-O2:** Where a `tickers.json` file exists, the system shall use it to configure the list of benchmark tickers.
*   **EARS-O3:** Where the user runs the `Generate_Graph.py` script, the system shall generate a graphical visualization of the portfolio's performance against a benchmark.
