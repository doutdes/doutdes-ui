export const IG_CHART = {
  AUD_CITY: 15,
  AUD_COUNTRY: 16,
  AUD_GENDER_AGE: 17,
  AUD_LOCALE: 18,
  ONLINE_FOLLOWERS: 19,
  EMAIL_CONTACTS: 20,
  FOLLOWER_COUNT: 21,
  DIR_CLICKS: 22,
  IMPRESSIONS: 23,
  PHONE_CALL_CLICKS: 24,
  PROFILE_VIEWS: 25,
  REACH: 26,
  TEXT_MESSAGE_CLICKS: 27,
  WEBSITE_CLICKS: 28
};

export interface IgPage {
  name: string;
  id: string;
}

export interface IgAnyData {
  value: Array<any>;
  end_time: Date;
}

export interface IgNumberData {
  value: number;
  end_time: Date;
}
