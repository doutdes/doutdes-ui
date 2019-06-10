export const GA_CHART = {
  IMPRESSIONS_DAY: 4,
  SESSION_DAY: 5,
  SOURCES_PIE: 6,
  MOST_VISITED_PAGES: 7,
  SOURCES_COLUMNS: 9,
  BOUNCE_RATE: 10,
  AVG_SESS_DURATION: 11,
  BROWSER_SESSION: 12,
  NEW_USERS: 24,
  MOBILE_DEVICES: 25,
  PAGE_LOAD_TIME: 26,
  PERCENT_NEW_SESSION: 27
};

export interface GoogleData {
  date: string;
  value: string;
  opt_value?: number;
}
