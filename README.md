# Planning Log Analyzer & Scenario Replayer

A root-cause analysis tool for planning/controls logs that computes KPIs, detects anomalies, and generates sharable reports.

## Features

- **Log Analysis**: Upload JSON/CSV planning logs
- **KPI Computation**: Latency, path efficiency, jerk spikes, stalls, near-misses
- **Visualization**: 2D trajectory viewer with timeline controls
- **Anomaly Detection**: Automatic issue flagging with severity levels
- **Report Generation**: Markdown reports with root-cause analysis

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Usage

1. Open `http://localhost:3000`
2. Upload a log file (see `sample_logs/sample.json` for format)
3. View KPIs, timeline visualization, and detected issues
4. Generate markdown reports for sharing

## API Endpoints

- `POST /analyze` - Analyze uploaded log file
- `POST /report` - Generate markdown report
- `GET /health` - Health check

## Tech Stack

- **Backend**: FastAPI, Python
- **Frontend**: React, TypeScript, Recharts
- **Visualization**: Three.js (2D top-down view)
