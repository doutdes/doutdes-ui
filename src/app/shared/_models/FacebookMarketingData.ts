
export const FBM_CHART = {
  AGE_REACH: 55,
  AGE_IMPRESSIONS: 56,
  AGE_SPEND: 57,
  AGE_INLINE: 58,
  AGE_CLICKS: 59,
  AGE_CPC: 60,
  AGE_CPP: 61,
  AGE_CTR: 62,

  GENDER_REACH: 63,
  GENDER_IMPRESSIONS: 64,
  GENDER_SPEND: 65,
  GENDER_INLINE: 66,
  GENDER_CLICKS: 67,
  GENDER_CPC: 68,
  GENDER_CPP: 69,
  GENDER_CTR: 70,

  GENDER_AGE_REACH: 71,
  GENDER_AGE_IMPRESSIONS: 72,
  GENDER_AGE_SPEND: 73,
  GENDER_AGE_INLINE: 74,
  GENDER_AGE_CLICKS: 75,
  GENDER_AGE_CPC: 76,
  GENDER_AGE_CPP: 77,
  GENDER_AGE_CTR: 78,

  COUNTRYREGION_REACH: 79,
  COUNTRYREGION_IMPRESSIONS: 80,
  COUNTRYREGION_SPEND: 81,
  COUNTRYREGION_INLINE: 82,
  COUNTRYREGION_CLICKS: 83,
  COUNTRYREGION_CPC: 84,
  COUNTRYREGION_CPP: 85,
  COUNTRYREGION_CTR: 86,

  HOURLYADVERTISER_IMPRESSIONS: 87,
  HOURLYADVERTISER_SPEND: 88,
  HOURLYADVERTISER_INLINE: 89,
  HOURLYADVERTISER_CLICKS: 90,
  HOURLYADVERTISER_CPC: 91,
  HOURLYADVERTISER_CTR: 92,

  HOURLYAUDIENCE_REACH: 93,
  HOURLYAUDIENCE_IMPRESSIONS: 94,
  HOURLYAUDIENCE_SPEND: 95,
  HOURLYAUDIENCE_INLINE: 96,
  HOURLYAUDIENCE_CLICKS: 97,
  HOURLYAUDIENCE_CPC: 98,
  HOURLYAUDIENCE_CPP: 99,
  HOURLYAUDIENCE_CTR: 100,
};

export interface FbmAnyData {
  value: Array<any>;
  end_time: Date;
}

export interface FbmPage {
  name: string;
  id: string;
}


