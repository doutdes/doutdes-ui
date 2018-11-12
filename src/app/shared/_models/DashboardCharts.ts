import {Chart} from './Chart';

export interface DashboardCharts {
  dashboard_id: number;
  chart_id: number;
  title: string;
  color?: string;
  chart?: Chart;
  chartData?: any;
  position?: number;
  error?: boolean;
}

