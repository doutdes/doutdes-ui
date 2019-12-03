export interface DashboardCharts {
  dashboard_id: number;
  chart_id: number;
  title: string;
  format: string;
  metric?: string;
  dimensions?: string;
  sort?: string;
  filter?: string;
  period?: string;
  interval?: number;
  breakdowns?: string;
  domain?: string;
  description: string;
  color?: string;
  chartData?: any;
  position?: number;
  error?: boolean;
  geoData?: any;
  originalTitle?: any;
  type?: number;
  aggregated?: any;
}

