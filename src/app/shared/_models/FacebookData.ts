export const FB_CHART = {
  FANS_DAY: 1,
  FANS_COUNTRY_GEOMAP: 2,
  IMPRESSIONS: 3,
  FANS_COUNTRY_PIE: 8,
  PAGE_VIEWS: 13,
  FANS_CITY: 14,
  ENGAGED_USERS: 29,
  PAGE_CONSUMPTION: 30,
  PAGE_PLACES_CHECKIN: 31,
  NEGATIVE_FEEDBACK: 32,
  ONLINE_FANS: 33,
  REACTIONS: 34,
  FANS_ADD: 35,
  FANS_REMOVES: 36,
  IMPRESSIONS_PAID: 37,
  VIDEO_VIEWS: 38,
  POST_IMPRESSIONS: 39,
  VIDEO_ADS: 40,
  REACTIONS_LINEA: 50,
  REACTIONS_COLUMN_CHART: 51,
  PAGE_VIEW_EXTERNALS: 52,
  PAGE_VIEW_EXTERNALS_LINEA: 53,
  PAGE_IMPRESSIONS_CITY: 54,
  PAGE_IMPRESSIONS_CITY_GEO: 55,
  PAGE_IMPRESSIONS_COUNTRY_ELENCO: 56,
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


