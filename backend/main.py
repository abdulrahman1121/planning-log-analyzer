from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import json
import uvicorn

app = FastAPI(title="Planning Log Analyzer", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/analyze")
async def analyze_log_file(file: UploadFile = File(...)):
    """Simple analyze endpoint that returns mock data"""
    try:
        content = await file.read()
        data = json.loads(content.decode('utf-8'))
        
        # Mock analysis result
        result = {
            "kpis": {
                "avg_latency_ms": 45.2,
                "p95_latency_ms": 78.5,
                "max_latency_ms": 120.0,
                "path_length": 8.5,
                "straight_line_distance": 5.8,
                "path_efficiency": 0.68,
                "max_curvature": 0.15,
                "jerk_spikes": 3,
                "stalls": 1,
                "near_misses": 0
            },
            "issues": [
                {
                    "code": "LOW_PATH_EFFICIENCY",
                    "message": "Path efficiency (0.68) is below threshold (0.8)",
                    "severity": "warning"
                }
            ],
            "derived": {
                "polyline": [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [5, 1], [5, 2], [5, 3]],
                "obstacles_time_series": [
                    {"t": 0.0, "obstacles": [[2, 1], [3, 1]], "pos": [0, 0]},
                    {"t": 1.0, "obstacles": [[2, 1], [3, 1]], "pos": [1, 0]},
                    {"t": 2.0, "obstacles": [[2, 1], [3, 1]], "pos": [2, 0]},
                    {"t": 3.0, "obstacles": [[2, 1], [3, 1]], "pos": [3, 0]},
                    {"t": 4.0, "obstacles": [[2, 1], [3, 1]], "pos": [4, 0]},
                    {"t": 5.0, "obstacles": [[2, 1], [3, 1]], "pos": [5, 0]},
                    {"t": 6.0, "obstacles": [[2, 1], [3, 1]], "pos": [5, 1]},
                    {"t": 7.0, "obstacles": [[2, 1], [3, 1]], "pos": [5, 2]},
                    {"t": 8.0, "obstacles": [[2, 1], [3, 1]], "pos": [5, 3]}
                ],
                "latency_timeline": [
                    {"t": 0.0, "latency": 45},
                    {"t": 1.0, "latency": 42},
                    {"t": 2.0, "latency": 48},
                    {"t": 3.0, "latency": 44},
                    {"t": 4.0, "latency": 46},
                    {"t": 5.0, "latency": 43},
                    {"t": 6.0, "latency": 47},
                    {"t": 7.0, "latency": 45},
                    {"t": 8.0, "latency": 44}
                ],
                "speed_timeline": [
                    {"t": 0.0, "speed": 0.0},
                    {"t": 1.0, "speed": 1.0},
                    {"t": 2.0, "speed": 2.0},
                    {"t": 3.0, "speed": 2.5},
                    {"t": 4.0, "speed": 3.0},
                    {"t": 5.0, "speed": 3.5},
                    {"t": 6.0, "speed": 4.0},
                    {"t": 7.0, "speed": 4.5},
                    {"t": 8.0, "speed": 0.0}
                ],
                "curvature_timeline": [
                    {"t": 1.0, "curvature": 0.0},
                    {"t": 2.0, "curvature": 0.0},
                    {"t": 3.0, "curvature": 0.0},
                    {"t": 4.0, "curvature": 0.0},
                    {"t": 5.0, "curvature": 0.0},
                    {"t": 6.0, "curvature": 0.1},
                    {"t": 7.0, "curvature": 0.1},
                    {"t": 8.0, "curvature": 0.0}
                ]
            }
        }
        
        return result
    except Exception as e:
        return {"error": str(e)}

@app.post("/report")
async def generate_report(file: UploadFile = File(...)):
    """Generate markdown report from log analysis"""
    try:
        content = await file.read()
        data = json.loads(content.decode('utf-8'))
        
        report = f"""# Planning Log Analysis Report

**Run ID:** {data.get('run_id', 'Unknown')}  
**Generated:** 2025-01-16 10:30:00  
**Total Frames:** {len(data.get('frames', []))}

## Key Performance Indicators

| Metric | Value |
|--------|-------|
| Average Latency | 45.2 ms |
| P95 Latency | 78.5 ms |
| Max Latency | 120.0 ms |
| Path Length | 8.5 m |
| Path Efficiency | 68% |
| Max Curvature | 0.15 |
| Jerk Spikes | 3 |
| Stalls | 1 |
| Near Misses | 0 |

## Issues Detected

- 🟡 **LOW_PATH_EFFICIENCY**: Path efficiency (0.68) is below threshold (0.8)

## Suggested Next Steps

- Optimize path planning algorithm for more direct routes
- Continue monitoring with current configuration
"""
        
        return {"report": report}
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
