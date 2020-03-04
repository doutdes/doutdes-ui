export const IG_CHART = { // ID charts in the database
  IMPRESSIONS: 15,
  AUD_GENDER_AGE: 16,
  AUD_LOCALE: 17,
  REACH: 18,
  AUD_CITY: 19,
  AUD_COUNTRY: 20,
  ACTION_PERFORMED: 21,
  ONLINE_FOLLOWERS: 22,
  PROFILE_VIEWS: 23,
  FOLLOWER_COUNT: 28,
  LOST_FOLLOWERS: 101,
  INFO_CLICKS_COL: 102,
  MEDIA_LIKE_DATA: 103,
  MEDIA_COMMENT_DATA: 104
};

export const IG_PALETTE = {
  // Took by the main color of the dashboard
  'FUCSIA' : {
    C1: '#be8a7a',
    C2: '#d69b8a',
    C3: '#eeac99',
    C4: '#f0b4a3',
    C5: '#f1bdad',
    C6: '#f3c5b8',
    C7: '#f5cdc2',
    C8: '#f7d6cc',
    C9: '#f8ded6',
    C10: '#fae6e0',
    C11: '#fceeeb',
    C12: '#fdf7f5',
  },
  // Soft purple-ish
  'LAVENDER' : {
    C1: '#6f278c',
    C2: '#7d2c9e',
    C3: '#8b31af',
    C4: '#9746b7',
    C5: '#a25abf',
    C6: '#ae6fc7',
    C7: '#b983cf',
    C8: '#c598d7',
    C9: '#d1addf',
    C10: '#dcc1e7',
    C11: '#e8d6ef',
    C12: '#f3eaf7',
  },

  // I used to believe this was blue
  'AMARANTH': {
    C1: '#cc0856',
    C2: '#e60961',
    C3: '#ff0a6c',
    C4: '#ff237b',
    C5: '#ff3b89',
    C6: '#ff5498',
    C7: '#ff6ca7',
    C8: '#ff85b6',
    C9: '#ff9dc4',
    C10: '#ffb6d3',
    C11: '#ffcee2',
    C12: '#ffe7f0',
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
