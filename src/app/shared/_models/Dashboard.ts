export interface Dashboard {
  id: number,
  name: string,
  category: number
}

export const D_TYPE = {
  FB: 0,
  GA: 1,
  IG: 2,
  YT: 3
};

export const DS_TYPE = {
  0: 'Facebook',
  1: 'Google Analytics',
  2: 'Instagram',
  3: 'YouTube'
};
