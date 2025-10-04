# Start Your Own

This folder lets you create your own LLM trading experiment.  
It contains the main trading script, a wrapper for convenience, and utilities to generate performance graphs.  
All output is saved to CSV files inside this folder.

---

## Setup

**Install dependencies:**
```bash
# Recommended: Use a virtual environment
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate

pip install -r requirements.txt
```

---

## Trading Script

The main script is `trading_script.py`. It updates the portfolio, logs trades, and prints daily results.

**Run the trading script:**
```bash
python trading_script.py --data-dir "Start Your Own"
```

### Argument Table for `trading_script.py`

| Argument            | Short | Type   | Default | Choices                               | Description                                   |
|---------------------|-------|--------|---------|---------------------------------------|-----------------------------------------------|
| `--data-dir`        |       | str    | None    |                                       | **Required.** Folder where CSV data is stored |
| `--asof`            |       | str    | None    |                                       | Treat this `YYYY-MM-DD` as "today"            |
| `--log-level`       |       | str    | None    | DEBUG, INFO, WARNING, ERROR, CRITICAL | Set the logging level (default: none)         |
| `--starting-equity` | `-s`  | float  | None    |                                       | Starting cash amount (e.g., `10000`)          |

### Examples
```bash
# Run with a specific data directory
python trading_script.py --data-dir "Start Your Own"

# Run as if today were 2025-10-01
python trading_script.py --data-dir "Start Your Own" --asof 2025-10-01

# Enable detailed logging
python trading_script.py --data-dir "Start Your Own" --log-level DEBUG

# Start with $10,000 in cash
python trading_script.py --data-dir "Start Your Own" --starting-equity 10000

# Combine multiple options
python trading_script.py --data-dir "Start Your Own" --asof 2025-10-01 --log-level INFO -s 5000
```

---

## ProcessPortfolio Wrapper

`Start Your Own/ProcessPortfolio.py` is a thin wrapper around `trading_script.py`.  
It automatically uses `"Start Your Own"` as the data directory, so you don’t have to pass `--data-dir` manually.

**Run with default settings:**
```bash
python "Start Your Own/ProcessPortfolio.py"
```

---

## Generate Performance Graphs

The `Generate_Graph.py` script plots portfolio performance using `chatgpt_portfolio_update.csv`.

**Run the graph generator:**
```bash
python "Start Your Own/Generate_Graph.py"
```

### Argument Table for `Generate_Graph.py`

| Argument       | Short | Type  | Default          | Choices | Description                                      |
|----------------|-------|-------|------------------|---------|--------------------------------------------------|
| `--start-date` |       | str   | Start date in CSV|         | Start date in `YYYY-MM-DD` format                |
| `--end-date`   |       | str   | End date in CSV  |         | End date in `YYYY-MM-DD` format                  |
| `--start-equity` |     | float | 100.0            |         | Baseline equity for indexing both series         |
| `--output`     |       | str   | None             |         | Save chart to file (`.png`, `.jpg`, or `.pdf`)   |

### Examples
```bash
# Generate graph for the entire CSV date range
python "Start Your Own/Generate_Graph.py"

# Generate graph for a specific period
python "Start Your Own/Generate_Graph.py" --start-date 2025-01-01 --end-date 2025-10-01

# Use a custom starting equity
python "Start Your Own/Generate_Graph.py" --start-equity 10000

# Save graph to a PNG file
python "Start Your Own/Generate_Graph.py" --output results.png

# Combine options
python "Start Your Own/Generate_Graph.py" --start-date 2025-01-01 --end-date 2025-10-01 --start-equity 5000 --output performance.pdf
```

---

## Important Notes

- **Run after market close (4:00 PM EST).**  
  Otherwise, the program will default to the previous trading day’s data.

- **Trades are generated after the market day ends.**  
  This prevents lookahead bias. For example, if trades are suggested on Monday, you should enter them on Tuesday’s market open.

- **How it works:**  
  - The program reads from `chatgpt_portfolio_update.csv` to get the latest portfolio state.  
  - If the file is empty, you will be prompted to enter your starting cash.  
  - The script allows recording manual buys and sells interactively.  
  - Results are saved to:  
    - `chatgpt_portfolio_update.csv` (portfolio snapshots)  
    - `chatgpt_trade_log.csv` (trade history)  
  - Daily results are printed in the terminal — copy these into ChatGPT for trading decisions.  

For automation, see the [Automation Guide](https://github.com/LuckyOne7777/ChatGPT-Micro-Cap-Experiment/blob/main/Other/AUTOMATION_README.md).

---

Both scripts are designed to be beginner-friendly. Feel free to experiment and modify them as you learn.  
This project is still evolving — please report bugs or questions!
