import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, Issue } from './types';
import { analyzeLog, generateReport } from './api';
import './App.css';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && analysisResult) {
      const maxTime = analysisResult.derived.obstacles_time_series[analysisResult.derived.obstacles_time_series.length - 1]?.t || 1;
      
      const animate = () => {
        setCurrentTime(prevTime => {
          const newTime = prevTime + 0.1;
          if (newTime >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return newTime;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, analysisResult]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setReport(null);

    try {
      const result = await analyzeLog(file);
      setAnalysisResult(result);
      setCurrentTime(result.derived.obstacles_time_series[0]?.t || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze log file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!fileInputRef.current?.files?.[0]) return;

    try {
      const result = await generateReport(fileInputRef.current.files[0]);
      setReport(result.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    }
  };

  const handleIssueClick = (issue: Issue) => {
    if (issue.timestamp !== undefined) {
      setCurrentTime(issue.timestamp);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (time: number) => {
    setCurrentTime(time);
    setIsPlaying(false); // Stop playing when manually scrubbing
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Planning Log Analyzer & Scenario Replayer</h1>
        <p>Upload planning/controls logs to analyze KPIs, detect anomalies, and generate reports</p>
      </header>

      <div className="main-content">
        {/* Left Sidebar */}
        <div className="sidebar">
          <div className="upload-section">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              className="upload-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Upload Log File'}
            </button>
            
            {analysisResult && (
              <button
                className="upload-button"
                onClick={handleGenerateReport}
                style={{ marginTop: '0.5rem', background: '#27ae60' }}
              >
                Generate Report
              </button>
            )}
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {analysisResult && (
            <>
              <div className="kpi-cards">
                <h3>Key Performance Indicators</h3>
                <div className="kpi-card">
                  <div className="kpi-title">Average Latency</div>
                  <div className="kpi-value">{analysisResult.kpis.avg_latency_ms.toFixed(1)} ms</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">P95 Latency</div>
                  <div className="kpi-value">{analysisResult.kpis.p95_latency_ms.toFixed(1)} ms</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Path Efficiency</div>
                  <div className="kpi-value">{(analysisResult.kpis.path_efficiency * 100).toFixed(1)}%</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Jerk Spikes</div>
                  <div className="kpi-value">{analysisResult.kpis.jerk_spikes}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Stalls</div>
                  <div className="kpi-value">{analysisResult.kpis.stalls}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Near Misses</div>
                  <div className="kpi-value">{analysisResult.kpis.near_misses}</div>
                </div>
              </div>

              <div className="issues-section">
                <h3>Issues Detected</h3>
                {analysisResult.issues.length === 0 ? (
                  <div style={{ color: '#27ae60', padding: '0.5rem' }}>
                    ✅ No issues detected
                  </div>
                ) : (
                  analysisResult.issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`issue-item ${issue.severity === 'error' ? 'issue-error' : 'issue-warning'}`}
                      onClick={() => handleIssueClick(issue)}
                    >
                      <div className="issue-code">{issue.code}</div>
                      <div className="issue-message">{issue.message}</div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Center Panel */}
        <div className="center-panel">
          <div className="timeline-controls">
            <button 
              className="play-button"
              onClick={handlePlayPause}
              disabled={!analysisResult}
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            
            <input
              type="range"
              min={analysisResult?.derived.obstacles_time_series[0]?.t || 0}
              max={analysisResult?.derived.obstacles_time_series[analysisResult?.derived.obstacles_time_series.length - 1]?.t || 1}
              step={0.01}
              value={currentTime}
              onChange={(e) => handleTimeChange(parseFloat(e.target.value))}
              className="timeline-slider"
              disabled={!analysisResult}
            />
            
            <div className="time-display">
              {currentTime.toFixed(2)}s / {analysisResult?.derived.obstacles_time_series[analysisResult?.derived.obstacles_time_series.length - 1]?.t.toFixed(2) || '0.00'}s
            </div>
          </div>
          
          <div className="viewer-container">
            <div className="simple-viewer">
              <h3>Trajectory Viewer</h3>
              {analysisResult ? (
                <div className="trajectory-info">
                  <p>Current Time: {currentTime.toFixed(2)}s</p>
                  <p>Current Position: {analysisResult.derived.obstacles_time_series.find(f => Math.abs(f.t - currentTime) < 0.05)?.pos.join(', ') || 'N/A'}</p>
                  <p>Obstacles: {analysisResult.derived.obstacles_time_series.find(f => Math.abs(f.t - currentTime) < 0.05)?.obstacles.length || 0}</p>
                </div>
              ) : (
                <p>Upload a log file to see trajectory visualization</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="bottom-panel">
        <div className="chart-container">
          <h3>Timeline Charts</h3>
          {analysisResult ? (
            <div className="charts-grid">
              <div className="chart">
                <h4>Latency Timeline</h4>
                <div className="simple-chart">
                  {analysisResult.derived.latency_timeline.map((point, index) => (
                    <div key={index} className="chart-point" style={{
                      left: `${(point.t / 8) * 100}%`,
                      bottom: `${(point.latency / 100) * 100}%`,
                      backgroundColor: Math.abs(point.t - currentTime) < 0.05 ? '#e74c3c' : '#3498db'
                    }} />
                  ))}
                </div>
              </div>
              <div className="chart">
                <h4>Speed Timeline</h4>
                <div className="simple-chart">
                  {analysisResult.derived.speed_timeline.map((point, index) => (
                    <div key={index} className="chart-point" style={{
                      left: `${(point.t / 8) * 100}%`,
                      bottom: `${(point.speed / 5) * 100}%`,
                      backgroundColor: Math.abs(point.t - currentTime) < 0.05 ? '#e74c3c' : '#27ae60'
                    }} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>Upload a log file to see timeline charts</p>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {report && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '80%',
            maxHeight: '80%',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setReport(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {report}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;