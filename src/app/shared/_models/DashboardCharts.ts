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

export let ErrorDashChart: DashboardCharts = {
  dashboard_id: null,
  chart_id: null,
  title: 'Error retrieving the chart data',
  color: '#FF703D',
  error: true
};
