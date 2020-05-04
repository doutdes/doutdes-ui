import {DashboardCharts} from '../../../shared/_models/DashboardCharts';

export interface IntervalDate {
  first: Date;
  last: Date;
}

export interface IntervalDateComparasion {
  first_1: Date;
  last_1: Date;
  first_2: Date;
  last_2: Date;
}

export interface DashboardData {
  data: DashboardCharts[];
  interval: IntervalDate;
  type: number;
  intervalComparasion?: IntervalDateComparasion;
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
