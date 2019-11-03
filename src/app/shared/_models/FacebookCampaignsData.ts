export const FBC_CHART = {
  CAMPAIGNS: 101,
  ADSETS: 102,
  ADS: 103,
};

export interface FbcAnyData {
  value: Array<any>;
  end_time: Date;
}

export interface FbcPage {
  name: string;
  id: string;
}


