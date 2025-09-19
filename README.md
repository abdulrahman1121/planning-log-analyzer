# Planning Log Analyzer & Scenario Replayer

A root-cause analysis tool for planning/controls logs that computes KPIs, detects anomalies, and generates sharable reports.

## Features

- **Log Analysis**: Upload JSON/CSV planning logs
- **KPI Computation**: Latency, path efficiency, jerk spikes, stalls, near-misses
- **Visualization**: 2D trajectory viewer with timeline controls
- **Anomaly Detection**: Automatic issue flagging with severity levels
- **Report Generation**: Markdown reports with root-cause analysis


## Tech Stack

- **Backend**: FastAPI, Python
- **Frontend**: React, TypeScript, Recharts
- **Visualization**: Three.js (2D top-down view)
