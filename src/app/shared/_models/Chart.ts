export interface Chart {
  ID: number;
  title: string;
  type: number;
  metric: string;
  dimensions?: string;
  sort?: string;
  filter?: string;
  period?: string;
  interval?: number;
  format: string;
  description: string;
}

export interface ChartParams {
  metric?: string;
  dimensions?: string;
  sort?: string;
  filter?: string;
  period?: string;
  interval?: number;
  breakdowns?: string;
  domain?: string;
  campaignsId?: string;
}
