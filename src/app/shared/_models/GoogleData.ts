export const GA_CHART = {
  IMPRESSIONS_DAY: 4,
  SESSION_DAY: 5,
  SOURCES_PIE: 6,
  MOST_VISITED_PAGES: 7,
  SOURCES_COLUMNS: 9,
  BOUNCE_RATE: 10,
  AVG_SESS_DURATION: 11,
  BROWSER_SESSION: 12
};

export interface GoogleDataWithDate {
  date: string;
  value: string;
}

export interface GoogleData {
  string: string;
  value: number;
}
