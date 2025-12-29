import { Pool, QueryResult } from "pg";

const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      // Neon requires SSL. Most hosted providers do.
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB || "tracker",
      password: process.env.POSTGRES_PASSWORD,
      port: Number(process.env.POSTGRES_PORT || 5432),
    });

export const query = (text: string, params?: any[]): Promise<QueryResult> => {
  return pool.query(text, params || []);
};
