export interface Calendar {
  id: number;
  user_id: number;
  title: string;
  dataStart: Date;
  dataEnd: Date;
  primaryColor: string;
  secondaryColor: string;
}

export interface NewCalendar {
  created: boolean;
  id: number;
  title: string;
}
