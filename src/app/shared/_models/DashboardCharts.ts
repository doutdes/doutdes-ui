import {Chart} from './Chart';

export interface DashboardCharts {
  dashboard_id: number;
  chart_id: number;
  title: string;
  format: string;
  color?: string;
  Chart?: Chart;
  chartData?: any;
  position?: number;
  error?: boolean;
  geoData?: any;
  type?: number;
  aggregated?: any;
}

