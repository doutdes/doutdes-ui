export interface User {
  id: number;
  username: string;
  email: string;
  company_name: string;
  vat_number: string;
  first_name: string;
  last_name: string;
  birth_place: string;
  birth_date: Date;
  fiscal_code: string;
  address: string;
  province: string;
  city: string;
  zip: string;
  password: string;
  user_type: string;
}

// TODO To use Interface for casting
// TODO To calculate the checksum into the backend
// https://stackoverflow.com/questions/40421100/how-to-parse-a-json-object-to-a-typescript-object
