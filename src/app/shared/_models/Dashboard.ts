export interface Dashboard {
  id: number,
  name: string,
  category: number
}

export const D_TYPE = {
  FB: 1,
  GA: 2,
  IG: 3,
  YT: 4
};

export const DS_TYPE = {
  0: 'Facebook',
  1: 'Google Analytics',
  2: 'Instagram',
  3: 'YouTube'
};
