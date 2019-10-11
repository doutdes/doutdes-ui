export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  vat_number?: string;
  birth_place?: string;
  birth_date?: Date;
  fiscal_code?: string;
  address?: string;
  province?: string;
  city?: string;
  zip?: string;
  password?: string;
  user_type?: string;
  checksum?: string;
  token?: string;
  lang?: string;
}
export interface VerifyResponse {
  verified: boolean;
  message: string;
}

