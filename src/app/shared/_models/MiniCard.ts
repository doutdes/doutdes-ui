import {D_TYPE} from './Dashboard';

export interface MiniCard {
  name: string,
  icon: string,
  padding: string;
  measure?: string;
  value?: string,
  progress?: string,
  step?: number,
  type?: number
}

export let GaMiniCards: MiniCard[] = [
  {
    name: 'Utenti tot.',
    icon: 'icon-people',
    padding: 'pl-0 pr-2',
    measure: '',
    value: '-'
  }, {
    name: 'Visite tot.',
    icon: 'icon-screen-desktop',
    padding: 'pl-2 pr-sm-2 pr-0',
    measure: '',
    value: '-'
  }, {
    name: 'Freq. rimbalzo',
    icon: 'icon-action-undo',
    padding: 'pl-sm-2 pl-0 pr-2 pt-sm-0 pt-3',
    measure: 'bounce-rate',
    value: '-'
  }, {
    name: 'Permanenza media',
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
    measure: 'count'
  }, {
    name: 'Post',
    icon: 'icon-speech',
    padding: 'pl-2 pr-sm-2 pr-0',
    value: '-',
    measure: 'post-sum'
  }, {
    name: 'Reazioni',
    icon: 'icon-heart',
    padding: 'pl-sm-2 pl-0 pr-2 pt-sm-0 pt-3',
    value: '-',
    measure: 'reactions'
  }, {
    name: 'Visite',
    icon: 'icon-screen-desktop',
    padding: 'pl-2 pr-0 pt-sm-0 pt-3',
    value: '-',
    measure: ''
  },
];
export let IgMiniCards: MiniCard[] = [
  {
    name: 'Follower',
    icon: 'icon-people',
    padding: 'pl-0 pr-2',
    value: '-',
    measure: 'count'
  }, {
    name: 'Post',
    icon: 'icon-speech',
    padding: 'pl-2 pr-sm-2 pr-0',
    value: '-',
    measure: 'post-sum'
  }, {
    name: 'Visite profilo',
    icon: 'icon-eye',
    padding: 'pl-sm-2 pl-0 pr-2 pt-sm-0 pt-3',
    value: '-',
    measure: 'prof-views'
  }, {
    name: 'Visual. post',
    icon: 'icon-screen-smartphone',
    padding: 'pl-2 pr-0 pt-sm-0 pt-3',
    value: '-',
    measure: ''
  }
];
export let CustomMiniCards: MiniCard[] = [
  {
    name: 'Utenti tot.',
    icon: 'fab fa-google',
    padding: 'pl-0 pr-2',
    measure: 'ga-tot-user',
    value: '-',
    type: D_TYPE.GA
  },
  {
    name: 'Fan',
    icon: 'fab fa-facebook',
    padding: 'pl-2 pr-sm-2 pr-0',
    value: '-',
    measure: 'fb-fan-count',
    type: D_TYPE.FB
  }, {
    name: 'Followers',
    icon: 'fab fa-instagram',
    padding: 'pl-sm-2 pl-0 pr-2 pt-sm-0 pt-3',
    value: '-',
    measure: 'ig-follower',
    type: D_TYPE.IG
  }, {
    name: 'Iscritti',
    icon: 'fab fa-youtube',
    padding: 'pl-2 pr-0 pt-sm-0 pt-3',
    measure: 'yt-subscribers',
    value: '30',
    type: D_TYPE.YT
  }
];
