import {DashboardCharts} from '../../../shared/_models/DashboardCharts';

export interface IntervalDate {
  first: Date;
  last: Date;
}

export interface DashboardData {
  data: DashboardCharts[];
  interval: IntervalDate;
  type: number;
}

export interface FilterState {
  currentDashboard: DashboardData;
  filteredDashboard: DashboardData;
  storedDashboards: DashboardData[];
}

export const FILTER_INITIAL_STATE: FilterState = {
  currentDashboard: null,
  filteredDashboard: null,
  storedDashboards: [],
};
