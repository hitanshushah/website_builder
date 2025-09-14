// server/db/models.ts
import { query } from './db';
import type { User, Profile } from '../../types';

export class UserModel {
  static async firstOrCreate(username: string, email: string): Promise<User> {
    const existingUsers = await query<User>(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (existingUsers.length > 0) {
      return existingUsers[0];
    }

    const newUsers = await query<User>(
      'INSERT INTO users (username, email, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
      [username, email]
    );

    return newUsers[0];
  }

  static async findById(id: number): Promise<User | null> {
    const users = await query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return users.length > 0 ? users[0] : null;
  }
}

export class ProfileModel {
  static async findByUserId(userId: number): Promise<Profile | null> {
    const profiles = await query<Profile>(
      'SELECT * FROM profiles WHERE user_id = $1',
      [userId]
    );
    return profiles.length > 0 ? profiles[0] : null;
  }

  static async create(userId: number, name: string): Promise<Profile> {
    const profiles = await query<Profile>(
      'INSERT INTO profiles (user_id, name, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
      [userId, name]
    );
    return profiles[0];
  }
}
