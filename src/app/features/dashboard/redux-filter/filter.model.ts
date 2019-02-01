export interface IntervalDate {
  first: Date;
  last: Date;
}

export interface FilterState {
  originalData: any;
  originalInterval: IntervalDate;
  dataFiltered: any;
  filterInterval: IntervalDate;
}

export const FILTER_INITIAL_STATE: FilterState = {
  originalData: null,
  originalInterval: null,
  dataFiltered: null,
  filterInterval: null
};
