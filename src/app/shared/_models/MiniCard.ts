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
    name: 'Users',
    icon: 'icon-people',
    padding: 'pl-0 pr-2',
    measure: '',
    value: '-'
  }, {
    name: 'Sessions',
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
    name: 'Session time',
    icon: 'icon-hourglass',
    padding: 'pl-2 pr-0 pt-sm-0 pt-3',
    measure: '',
    value: '-'
  },
];
export let FbMiniCards: MiniCard[] = [
  {
    name: 'Fan',
    icon: 'icon-people',
    padding: 'pl-0 pr-2',
    value: '-'
  }, {
    name: 'Post',
    icon: 'icon-star',
    padding: 'pl-2 pr-sm-2 pr-0',
    value: '-'
  }, {
    name: 'Reactions',
    icon: 'icon-people',
    padding: 'pl-sm-2 pl-0 pr-2 pt-sm-0 pt-3',
    value: '-'
  }, {
    name: 'Copertura post',
    icon: 'icon-clock',
    padding: 'pl-2 pr-0 pt-sm-0 pt-3',
    value: '-'
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
