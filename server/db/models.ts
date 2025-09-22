// server/db/models.ts
import { query } from './db';
import type { User, Profile, Education } from '../../app/types';

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

  static async getAllUsers(): Promise<User[]> {
    const users = await query<User>(
      'SELECT * FROM users ORDER BY created_at DESC'
    );
    return users;
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

export class EducationModel {
  static async findByProfileId(profileId: number): Promise<Education[]> {
    const education = await query<Education>(
      'SELECT * FROM education WHERE profile_id = $1 AND deleted_at IS NULL ORDER BY end_date DESC NULLS LAST, from_date DESC',
      [profileId]
    );
    return education;
  }

  static async create(
    profileId: number,
    universityName: string,
    degree: string,
    fromDate?: string,
    endDate?: string,
    location?: string,
    cgpa?: number
  ): Promise<Education> {
    const education = await query<Education>(
      'INSERT INTO education (profile_id, university_name, degree, from_date, end_date, location, cgpa, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *',
      [profileId, universityName, degree, fromDate, endDate, location, cgpa]
    );
    return education[0];
  }

  static async update(
    id: number,
    universityName: string,
    degree: string,
    fromDate?: string,
    endDate?: string,
    location?: string,
    cgpa?: number
  ): Promise<Education> {
    const education = await query<Education>(
      'UPDATE education SET university_name = $2, degree = $3, from_date = $4, end_date = $5, location = $6, cgpa = $7, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id, universityName, degree, fromDate, endDate, location, cgpa]
    );
    return education[0];
  }

  static async delete(id: number): Promise<void> {
    await query(
      'UPDATE education SET deleted_at = NOW() WHERE id = $1',
      [id]
    );
  }
}
