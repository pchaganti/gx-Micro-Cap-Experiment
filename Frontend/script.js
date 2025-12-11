const chartEl = document.getElementById('chart');
const statsEl = document.getElementById('stats');

const files = {
  portfolio: 'Daily Updates.csv',
  sp500: 'sp500.csv',
  russell: 'russell.csv'
};

function showMessage(message, type = 'loading') {
  if (!message) {
    chartEl.innerHTML = "";
    return;
  }

  const div = document.createElement('div');
  div.className = type;
  div.textContent = message;

  chartEl.innerHTML = '';
  chartEl.appendChild(div);
}


function parseCSV(text) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  const pushValue = (arr, value) => {
    const unquoted = value.replace(/^"|"$/g, '').replace(/""/g, '"');
    arr.push(unquoted.trim());
  };

  let row = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      pushValue(row, current);
      current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (current !== '' || row.length) {
        pushValue(row, current);
        rows.push(row);
        row = [];
        current = '';
      }
    } else {
      current += char;
    }
  }
  if (current !== '' || row.length) {
    pushValue(row, current);
    rows.push(row);
  }
  return rows;
}

function csvToObjects(text) {
  const rows = parseCSV(text);
  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = r[idx] ?? '';
    });
    return obj;
  });
}

function toDate(dateStr) {
  const parsed = new Date(dateStr);
  return isNaN(parsed) ? null : parsed;
}

async function loadCSV(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Unable to load ${path}`);
  const text = await res.text();
  return csvToObjects(text);
}

function formatCurrency(value) {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

function formatDate(date) {
  return date ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
}

function calculateRunStats(series) {
  if (!series.length) return null;
  let minVal = series[0].value;
  let minDate = series[0].date;
  let maxGain = 0;
  let gainStart = minDate;
  let gainEnd = minDate;

  let peakVal = series[0].value;
  let peakDate = series[0].date;
  let maxDrawdown = 0;
  let ddStart = peakDate;
  let ddEnd = peakDate;

  series.forEach(({ value, date }) => {
    if (value < minVal) {
      minVal = value;
      minDate = date;
    }
    if (value - minVal > maxGain) {
      maxGain = value - minVal;
      gainStart = minDate;
      gainEnd = date;
    }

    if (value > peakVal) {
      peakVal = value;
      peakDate = date;
    }
    if (peakVal - value > maxDrawdown) {
      maxDrawdown = peakVal - value;
      ddStart = peakDate;
      ddEnd = date;
    }
  });

  return {
    latest: series[series.length - 1],
    gain: { amount: maxGain, start: gainStart, end: gainEnd, startValue: minVal, endValue: maxGain + minVal },
    drawdown: { amount: maxDrawdown, start: ddStart, end: ddEnd, startValue: peakVal, endValue: peakVal - maxDrawdown }
  };
}

function renderStats(stats) {
  if (!stats) return;
  statsEl.innerHTML = '';

  const blocks = [
    {
      title: 'Latest Portfolio Value',
      content: `${formatCurrency(stats.latest.value)} on ${formatDate(stats.latest.date)}`
    },
    {
      title: 'Largest Gain Run',
      content: `${formatCurrency(stats.gain.amount)} (from ${formatCurrency(stats.gain.startValue)} on ${formatDate(stats.gain.start)} to ${formatCurrency(stats.gain.endValue)} on ${formatDate(stats.gain.end)})`
    },
    {
      title: 'Max Drawdown',
      content: `${formatCurrency(stats.drawdown.amount)} (from ${formatCurrency(stats.drawdown.startValue)} on ${formatDate(stats.drawdown.start)} to ${formatCurrency(stats.drawdown.endValue)} on ${formatDate(stats.drawdown.end)})`
    }
  ];

  blocks.forEach(({ title, content }) => {
    const stat = document.createElement('div');
    stat.className = 'stat';
    stat.innerHTML = `<h3>${title}</h3><p>${content}</p>`;
    statsEl.appendChild(stat);
  });
}

function plotData(portfolio, sp500, russell) {
  const layout = {
    margin: { t: 12, r: 24, l: 48, b: 48 },
    hovermode: 'x unified',
    legend: { orientation: 'h', y: -0.25 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Inter, system-ui, sans-serif', color: '#1b1c20' },
    yaxis: { title: 'Value (USD)', gridcolor: '#e8ebef' },
    xaxis: { title: 'Date', gridcolor: '#e8ebef' }
  };

  const commonLine = { shape: 'spline', smoothing: 1.1, width: 3 };
  const commonMarker = { size: 6 };

  const traces = [
    {
      name: 'ChatGPT Portfolio',
      x: portfolio.map((d) => d.date),
      y: portfolio.map((d) => d.value),
      mode: 'lines+markers',
      line: { ...commonLine, color: '#0f6bff' },
      marker: { ...commonMarker, color: '#0f6bff' },
      hovertemplate: '%{x|%b %d, %Y}<br>Equity: $%{y:.2f}<extra></extra>'
    },
    {
      name: 'S&P 500 Baseline',
      x: sp500.map((d) => d.date),
      y: sp500.map((d) => d.value),
      mode: 'lines+markers',
      line: { ...commonLine, color: '#f39c12' },
      marker: { ...commonMarker, color: '#f39c12' },
      hovertemplate: '%{x|%b %d, %Y}<br>S&P 500: $%{y:.2f}<extra></extra>'
    },
    {
      name: 'Russell 2000 Baseline',
      x: russell.map((d) => d.date),
      y: russell.map((d) => d.value),
      mode: 'lines+markers',
      line: { ...commonLine, color: '#27ae60' },
      marker: { ...commonMarker, color: '#27ae60' },
      hovertemplate: '%{x|%b %d, %Y}<br>Russell 2000: $%{y:.2f}<extra></extra>'
    }
  ];

  Plotly.newPlot(chartEl, traces, layout, { responsive: true, displaylogo: false });
}

function toSeries(data, valueKey) {
  return data
    .map((row) => ({ date: toDate(row.Date), value: parseFloat(row[valueKey]) }))
    .filter((d) => d.date && !Number.isNaN(d.value))
    .sort((a, b) => a.date - b.date);
}

async function init() {
  showMessage('Loading data…');
  try {
    const [portfolioRows, sp500Rows, russellRows] = await Promise.all([
      loadCSV("/Scripts and CSV Files/Daily Updates.csv"),
      loadCSV("Baseline CSVs/sp500.csv"),
      loadCSV("Baseline CSVs/russell.csv")
    ]);
    
    const portfolioData = portfolioRows.filter((r) => (r.Ticker || '').toUpperCase() === 'TOTAL');
    const portfolioSeries = toSeries(portfolioData, 'Total Equity');
    const sp500Series = toSeries(sp500Rows, 'Adjusted Value');
    const russellSeries = toSeries(russellRows, 'Adjusted Value');
  showMessage("")
    if (!portfolioSeries.length) throw new Error('No portfolio data found.');

    plotData(portfolioSeries, sp500Series, russellSeries);
    renderStats(calculateRunStats(portfolioSeries));
  } catch (err) {
    console.error(err);
    showMessage(err.message || 'Failed to load data.', 'error');
  }
}
document.addEventListener('DOMContentLoaded', init);
