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

export const GA_PALETTE = {
  // orange that becomes a little pink-ish
  'ORANGE' : {
    C1: '#8f3200',
    C2: '#a33900',
    C3: '#b84000',
    C4: '#cc4700',
    C5: '#e04f00',
    C6: '#f55600',
    C7: '#ff5900',
    C8: '#ff6d1f',
    C9: '#ff7a33',
    C10: '#ff8847',
    C11: '#ff955c',
    C12: '#ffa270',
  },
  // soft yellow
  'OCHER' : {
    C1: '#a38300',
    C2: '#b89300',
    C3: '#cca300',
    C4: '#e0b400',
    C5: '#f5c400',
    C6: '#ffce0a',
    C7: '#ffd21f',
    C8: '#ffd633',
    C9: '#ffda47',
    C10: '#ffde5c',
    C11: '#ffe270',
    C12: '#ffe785',
  },

  // soft green
  'LIME': {
    C1: '#4d721d',
    C2: '#588221',
    C3: '#639226',
    C4: '#6ea22a',
    C5: '#79b22e',
    C6: '#84c332',
    C7: '#8ecd3c',
    C8: '#98d14d',
    C9: '#a1d55d',
    C10: '#aedb72',
    C11: '#b4de7d',
    C12: '#bde28d',
  }
};

export interface GoogleData {
  date: string;
  value: string;
  opt_value?: number;
}
