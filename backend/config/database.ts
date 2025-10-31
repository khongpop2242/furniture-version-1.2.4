import 'dotenv/config';
// Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'furniture_office',
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci'
};

// DATABASE_URL สำหรับ Prisma
const getDatabaseUrl = () => {
  const { user, password, host, port, database } = dbConfig;
  return `mysql://${user}:${password}@${host}:${port}/${database}`;
};

export {
  dbConfig,
  getDatabaseUrl
}; 