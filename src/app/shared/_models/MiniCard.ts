export interface MiniCard {
  name: string,
  icon: string,
  padding: string;
  measure?: string;
  value?: string,
  progress?: string,
  step?: number
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
    measure: 'bounce-rate',
    value: '-'
  }, {
    name: 'Avg sess. time',
    icon: 'icon-hourglass',
    padding: 'pl-2 pr-0 pt-sm-0 pt-3',
    measure: 'time',
    value: '-'
  },
];
export let FbMiniCards: MiniCard[] = [
  {
    name: 'Fans',
    icon: 'icon-people',
    padding: 'pl-0 pr-2',
    value: '-',
    measure: 'count'
  }, {
    name: 'Posts',
    icon: 'icon-speech',
    padding: 'pl-2 pr-sm-2 pr-0',
    value: '-',
    measure: 'post-sum'
  }, {
    name: 'Reactions',
    icon: 'icon-heart',
    padding: 'pl-sm-2 pl-0 pr-2 pt-sm-0 pt-3',
    value: '-',
    measure: 'reactions'
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
    name: 'Fans',
    icon: 'icon-people',
    padding: 'pl-0 pr-2',
    value: '-',
    measure: 'count'
  }, {
    name: 'Posts',
    icon: 'icon-speech',
    padding: 'pl-2 pr-sm-2 pr-0',
    value: '-',
    measure: 'post-sum'
  }, {
    name: 'Profile views',
    icon: 'icon-eye',
    padding: 'pl-sm-2 pl-0 pr-2 pt-sm-0 pt-3',
    value: '-',
    measure: ''
  }, {
    name: 'Impressions',
    icon: 'icon-screen-smartphone',
    padding: 'pl-2 pr-0 pt-sm-0 pt-3',
    value: '-',
    measure: ''
  }
];
