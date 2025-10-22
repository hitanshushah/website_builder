// server/db.ts
import pkg from 'pg';
import { User } from '../../app/types'

const { Pool } = pkg;
const config = useRuntimeConfig()
const pool = new Pool({
  user: config.dbUsername,
  host: config.dbHost,
  database: config.dbDatabase,
  password: config.dbPassword,
  port: Number(config.dbPort),
});

export const query = async <T>(text: string, params?: any[]): Promise<T[]> => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
};

export type { User };
