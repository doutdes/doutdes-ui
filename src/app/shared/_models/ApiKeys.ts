export interface ApiKey {
  user_id: number;
  api_key: string;
  service_id?: number;
}

export interface Service {
  name: string;
  type: number;
  permissions: string;
}
