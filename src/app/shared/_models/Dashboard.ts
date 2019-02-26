export interface Dashboard {
  id: number,
  name: string,
  category: number
}

export const D_TYPE = {
  CUSTOM: 0,
  FB: 1,
  GA: 2,
  IG: 3,
  YT: 4
};

export const DS_TYPE = {
  0: 'Custom',
  1: 'Facebook',
  2: 'Google Analytics',
  3: 'Instagram',
  4: 'YouTube'
};
