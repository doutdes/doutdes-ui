export const IG_CHART = { // ID charts in the database
  IMPRESSIONS: 15,
  AUD_GENDER_AGE: 16,
  AUD_LOCALE: 17,
  REACH: 18,
  AUD_CITY: 19,
  AUD_COUNTRY: 20,
  ACTION_PERFORMED: 21,
  //ONLINE_FOLLOWERS: 22,
  PROFILE_VIEWS: 23,
  FOLLOWER_COUNT: 28,
};

export const IG_PALETTE = {
  // Took by the main color of the dashboard
  'FUCSIA' : {
    C1: '#66005f',
    C2: '#7a0072',
    C3: '#8f0085',
    C4: '#a30098',
    C5: '#b800ab',
    C6: '#cc00be',
    C7: '#e000d1',
    C8: '#f500e4',
    C9: '#ff00ee',
    C10: '#ff1ff0',
    C11: '#ff33f1',
    C12: '#ff47f3',
  },
  // Soft purple-ish
  'LAVENDER' : {
    C1: '#4c1b5f',
    C2: '#591f6f',
    C3: '#65247f',
    C4: '#72288f',
    C5: '#7f2d9f',
    C6: '#8b31af',
    C7: '#9836bf',
    C8: '#a240c9',
    C9: '#aa50ce',
    C10: '#b05ed1',
    C11: '#b970d7',
    C12: '#c180db',
  },

  // I used to believe this was blue
  'AMARANTH': {
    C1: '#660029',
    C2: '#7a0031',
    C3: '#8f0039',
    C4: '#a30041',
    C5: '#b80049',
    C6: '#cc0052',
    C7: '#e0005a',
    C8: '#f50062',
    C9: '#ff0a6c',
    C10: '#ff1f78',
    C11: '#ff3385',
    C12: '#ff4791',
  }
};

export interface IgPage {
  name: string;
  id: string;
}

export interface IgMedia {
  id: number;
  media_type: string;
  timestamp: Date;
}

export interface IgBusinessInfo {
  id: number;
  follower_count: number;
  media_count: number;
}

export interface IgData {
  value: any;
  end_time: Date;
}

export interface IgNumberData {
  value: number;
  end_time: Date;
}
