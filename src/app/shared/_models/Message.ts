export interface Message {
  id: number;
  title: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  is_read?: boolean;
}
