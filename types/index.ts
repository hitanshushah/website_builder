// types/index.ts
export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Profile {
  id: number;
  user_id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}
