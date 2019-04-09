export interface DashboardCharts {
  dashboard_id: number;
  chart_id: number;
  title: string;
  format: string;
  color?: string;
  chartData?: any;
  position?: number;
  error?: boolean;
  geoData?: any;
  originalTitle?:any;
  type?: number;
  aggregated?: any;
}

