export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  /** ISO 8601 timestamp — Django `date_joined`. Server-set, read-only. */
  date_joined?: string;
}
