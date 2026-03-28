import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.SUPABASE_DB_URL.replace('sslmode=require', 'sslmode=verify-full');

if (!dbUrl) {
  console.error('SUPABASE_DB_URL no está configurada');
  process.exit(1);
}

const client = new pg.Client({
  host: 'db.gllknvijrfrvnozsxkyk.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'ZrMyvyPZmgnTTzw8',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  query_timeout: 60000,
  family: 4
});

async function applySchema() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    const schemaPath = path.join(__dirname, '..', '..', 'supabase', 'complete-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('Ejecutando esquema...');
    await client.query(schemaSQL);
    console.log('Esquema aplicado exitosamente');

  } catch (error) {
    console.error('Error aplicando esquema:', error);
  } finally {
    await client.end();
  }
}

applySchema();