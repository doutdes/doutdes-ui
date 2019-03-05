export const FB_CHART = {
  FANS_DAY: 1,
  FANS_COUNTRY_GEOMAP: 2,
  IMPRESSIONS: 3,
  FANS_COUNTRY_PIE: 8,
  PAGE_VIEWS: 13,
  FANS_CITY: 14
};

export interface FbPage {
  name: string;
  id: string;
}

export interface FbPost {
  id: string,
  created_time: Date,
  name?: string
}

export interface FbAnyData {
  value: Array<any>;
  end_time: Date;
}

export interface FbNumberData {
  value: number;
  end_time: Date;
}
