// server/api/users.get.ts
import { User } from '../../types';
import { query } from '../db/db'

export default defineEventHandler(async () => {
  const users: User[] = await query<User>('SELECT * FROM users');
  return users;
});
