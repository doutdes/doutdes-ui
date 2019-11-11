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
  //VIDEO_ADS: 40,
  REACTIONS_LINEA: 48,
  REACTIONS_COLUMN_CHART: 49,
  PAGE_VIEW_EXTERNALS: 50,
  PAGE_VIEW_EXTERNALS_LINEA: 51,
  PAGE_IMPRESSIONS_CITY: 52,
  PAGE_IMPRESSIONS_CITY_GEO: 53,
  PAGE_IMPRESSIONS_COUNTRY_ELENCO: 54,
};

export const FB_PALETTE = {
  //in reference with FB logo
  'BLUE' : {
    C1: '#17334f',
    C2: '#1c3d5f',
    C3: '#20476f',
    C4: '#25527e',
    C5: '#295c8e',
    C6: '#2e669e',
    C7: '#3270ae',
    C8: '#377abe',
    C9: '#4185c8',
    C10: '#518fcd',
    C11: '#6199d1',
    C12: '#71a3d6',
  },
  //between blue and green
  'TURQUOISE' : {
    C1: '#12685a',
    C2: '#157969',
    C3: '#188b78',
    C4: '#1c9c87',
    C5: '#1fad96',
    C6: '#22bfa5',
    C7: '#25d0b4',
    C8: '#2fdabe',
    C9: '#40ddc3',
    C10: '#52e0c9',
    C11: '#63e3ce',
    C12: '#74e7d3',
  },

  //blue, but greyer
  'STIFFKEY': {
    C1: '#244c56',
    C2: '#2a5965',
    C3: '#306673',
    C4: '#387685',
    C5: '#3c7f90',
    C6: '#428c9e',
    C7: '#4899ad',
    C8: '#52a3b7',
    C9: '#61aabd',
    C10: '#6fb2c3',
    C11: '#7ebac9',
    C12: '#8cc1cf',
  }
};
export interface FbPage {
  name: string;
  id: string;
}

export interface FbPost {
  id: string;
  created_time: Date;
  name?: string;
}

export interface FbData {
  value: Array<any> | number;
  end_time: Date;
}

export interface FbNumberData {
  value: number;
  end_time: Date;
}


