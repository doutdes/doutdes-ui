export interface ApiKey {
  user_id?: number;
  api_key?: string;
  service_id?: number;
  ga_view_id?: string;
}

export interface Service {
  name: string;
  type: number;
  granted?: boolean;
  scopes: string[];
}
