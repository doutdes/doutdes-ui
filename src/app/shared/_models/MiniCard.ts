export interface MiniCard {
  name: string,
  icon: string,
  padding: string;
  measure?: string;
  value?: string,
  progress?: string
}

export let GaMiniCards: MiniCard[] = [
  {
    name: 'Tot users',
    icon: 'icon-people',
    padding: 'pl-0 pr-2',
    measure: '',
    value: '-'
  }, {
    name: 'Tot sessions',
    icon: 'icon-screen-desktop',
    padding: 'pl-2 pr-sm-2 pr-0',
    measure: '',
    value: '-'
  }, {
    name: 'Bounce rate',
    icon: 'icon-action-undo',
    padding: 'pl-sm-2 pl-0 pr-2 pt-sm-0 pt-3',
    measure: '%',
    value: '-'
  }, {
    name: 'Avg session time',
    icon: 'icon-hourglass',
    padding: 'pl-2 pr-0 pt-sm-0 pt-3',
    measure: 'time',
    value: '-'
  },
];
export let FbMiniCards: MiniCard[] = [
  {
    name: 'Fan',
    icon: 'icon-people',
    padding: 'pl-0 pr-2',
    value: '-',
    measure: ''
  }, {
    name: 'Post',
    icon: 'icon-speech',
    padding: 'pl-2 pr-sm-2 pr-0',
    value: '-',
    measure: ''
  }, {
    name: 'Reactions',
    icon: 'icon-heart',
    padding: 'pl-sm-2 pl-0 pr-2 pt-sm-0 pt-3',
    value: '-',
    measure: ''
  }, {
    name: 'Impressions',
    icon: 'icon-screen-desktop',
    padding: 'pl-2 pr-0 pt-sm-0 pt-3',
    value: '-',
    measure: ''
  },
];
export let IgMiniCards: MiniCard[] = [
  {
    name: 'Fan',
    icon: 'icon-people',
    padding: 'pl-0 pr-2',
    value: '-'
  }, {
    name: 'Impressions',
    icon: 'icon-star',
    padding: 'pl-2 pr-sm-2 pr-0',
    value: '-'
  }, {
    name: 'Profile view',
    icon: 'icon-people',
    padding: 'pl-sm-2 pl-0 pr-2 pt-sm-0 pt-3',
    value: '-'
  }, {
    name: 'Cinghiali',
    icon: 'icon-clock',
    padding: 'pl-2 pr-0 pt-sm-0 pt-3',
    value: '-'
  },
];
