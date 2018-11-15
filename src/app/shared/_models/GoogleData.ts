export interface GoogleDataWithDate {
  date: string;
  value: string;
}

export interface GoogleData {
  string: string;
  value: number;
}

export interface GooglePageViews {
  data: GoogleDataWithDate[];
}

export interface GoogleSessions {
  data: GoogleDataWithDate[];
}

export interface GoogleMostViews {
  data: GoogleData[];
}

export interface GoogleSources {
  data: GoogleData[];
}

export interface GoogleViewsByCountry {
  data: GoogleData[];
}

export interface GoogleBrowsers {
  data: GoogleData[];
}

export interface GoogleBounceRate {
  data: GoogleDataWithDate[];
}

export interface GoogleAvgSessionDuration {
  data: GoogleDataWithDate[];
}

export interface GooglePageViewsPerSession {
  data: GoogleDataWithDate[];
}

export interface GoogleNewUsers {
  data: GoogleDataWithDate[];
}
