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
