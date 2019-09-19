import {D_TYPE} from './Dashboard';

export interface MiniCard {
  name?: string;
  icon: string;
  padding: string;
  measure?: string;
  value?: string;
  progress?: string;
  step?: number;
  type?: number;
}

export let GaMiniCards: MiniCard[] = [
  {
    icon: 'icon-people',
    padding: 'pl-0 pr-2',
    measure: '',
    value: '-'
  }, {
    icon: 'icon-screen-desktop',
    padding: 'pl-2 pr-sm-2 pr-0',
    measure: '',
    value: '-'
  }, {
    icon: 'icon-action-undo',
    padding: 'pl-sm-2 pl-0 pr-2 pt-sm-0 pt-3',
    measure: 'bounce-rate',
    value: '-'
  }, {
    icon: 'icon-hourglass',
    padding: 'pl-2 pr-0 pt-sm-0 pt-3',
    measure: 'time',
    value: '-'
  },
];
export let FbMiniCards: MiniCard[] = [
  {
    icon: 'icon-people',
    padding: 'pl-0 pr-2',
    value: '-',
    measure: 'count'
  }, {
    icon: 'icon-speech',
    padding: 'pl-2 pr-sm-2 pr-0',
    value: '-',
    measure: 'post-sum'
  }, {
    icon: 'icon-heart',
    padding: 'pl-sm-2 pl-0 pr-2 pt-sm-0 pt-3',
    value: '-',
    measure: 'reactions'
  }, {
    icon: 'icon-screen-desktop',
    padding: 'pl-2 pr-0 pt-sm-0 pt-3',
    value: '-',
    measure: ''
  },
];
export let IgMiniCards: MiniCard[] = [
  {
    icon: 'icon-people',
    padding: 'pl-0 pr-2',
    value: '-',
    measure: 'count'
  }, {
    icon: 'icon-speech',
    padding: 'pl-2 pr-sm-2 pr-0',
    value: '-',
    measure: 'post-sum'
  }, {
    icon: 'icon-eye',
    padding: 'pl-sm-2 pl-0 pr-2 pt-sm-0 pt-3',
    value: '-',
    measure: 'prof-views'
  }, {
    icon: 'icon-screen-smartphone',
    padding: 'pl-2 pr-0 pt-sm-0 pt-3',
    value: '-',
    measure: ''
  }
];

export let YtMiniCards: MiniCard[] = [
  {
    icon: 'icon-people',
    padding: 'pl-0 pr-2',
    measure: 'subs',
    value: '-',
    type: D_TYPE.YT
  }, {
    icon: 'icon-screen-desktop',
    padding: 'pl-2 pr-sm-2 pr-0',
    measure: 'views',
    value: '-',
    type: D_TYPE.YT

  }, {
    icon: 'icon-action-undo',
    padding: 'pl-sm-2 pl-0 pr-2 pt-sm-0 pt-3',
    measure: 'avg-v-time',
    value: '-',
    type: D_TYPE.YT

  }, {
    icon: 'icon-hourglass',
    padding: 'pl-2 pr-0 pt-sm-0 pt-3',
    measure: 'vids',
    value: '-',
    type: D_TYPE.YT

  },
];


export let CustomMiniCards: MiniCard[] = [
  {
    icon: 'fab fa-google',
    padding: 'pl-0 pr-2',
    measure: 'ga-tot-user',
    value: '-',
    type: D_TYPE.GA
  },
  {
    icon: 'fab fa-facebook',
    padding: 'pl-2 pr-sm-2 pr-0',
    value: '-',
    measure: 'fb-fan-count',
    type: D_TYPE.FB
  }, {
    icon: 'fab fa-instagram',
    padding: 'pl-sm-2 pl-0 pr-2 pt-sm-0 pt-3',
    value: '-',
    measure: 'ig-follower',
    type: D_TYPE.IG
  }, {
    icon: 'fab fa-youtube',
    padding: 'pl-2 pr-0 pt-sm-0 pt-3',
    measure: 'subs',
    value: '-',
    type: D_TYPE.YT
  }
];
