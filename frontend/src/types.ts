export interface Frame {
  t: number;
  pos: [number, number];
  vel: number;
  latency_ms: number;
  obstacles: [number, number][];
  planner?: string;
}

export interface LogData {
  run_id: string;
  frames: Frame[];
  goal: [number, number];
}

export interface KPI {
  avg_latency_ms: number;
  p95_latency_ms: number;
  max_latency_ms: number;
  path_length: number;
  straight_line_distance: number;
  path_efficiency: number;
  max_curvature: number;
  jerk_spikes: number;
  stalls: number;
  near_misses: number;
}

export interface Issue {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  timestamp?: number;
  frame_index?: number;
}

export interface AnalysisResult {
  kpis: KPI;
  issues: Issue[];
  derived: {
    polyline: [number, number][];
    obstacles_time_series: Array<{
      t: number;
      obstacles: [number, number][];
      pos: [number, number];
    }>;
    latency_timeline: Array<{
      t: number;
      latency: number;
    }>;
    speed_timeline: Array<{
      t: number;
      speed: number;
    }>;
    curvature_timeline: Array<{
      t: number;
      curvature: number;
    }>;
  };
}

export interface ReportResult {
  report: string;
}