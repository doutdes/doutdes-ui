export const YT_CHART = {
  VIEWS: 41,
  COMMENTS: 42,
  LIKES: 43,
  DISLIKES: 44,
  SHARES: 45,
  AVGVIEW: 46,
  ESTWATCH: 47
};

export const YT_PALETTE = {
  // Took by the main color of the dashboard
  'RED': {
    C1: '#520000',
    C2: '#660000',
    C3: '#7a0000',
    C4: '#8f0000',
    C5: '#a30000',
    C6: '#b80000',
    C7: '#cc0000',
    C8: '#e00000',
    C9: '#f50000',
    C10: '#ff0a0a',
    C11: '#ff1f1f',
    C12: '#ff3333',
  },
  // Don't resemble anything good, but it's coherent with red
  'BROWN': {
    C1: '#421a10',
    C2: '#4d1e12',
    C3: '#632617',
    C4: '#742d1b',
    C5: '#84331f',
    C6: '#953a23',
    C7: '#a54027',
    C8: '#b6462b',
    C9: '#c64d2f',
    C10: '#d05739',
    C11: '#d46549',
    C12: '#d8735a',
  },

  // Greyer purple
  'OPAL': {
    C1: '#322026',
    C2: '#3e282f',
    C3: '#4b3039',
    C4: '#5b3a45',
    C5: '#64404c',
    C6: '#704855',
    C7: '#7c505f',
    C8: '#895868',
    C9: '#955f71',
    C10: '#a06a7c',
    C11: '#a77687',
    C12: '#af8392',
  }
};

export interface YtPage {
  name: string;
  title: string;
  id: string;
}

export interface YoutubeData {
  date: string;
  value: string;
}
