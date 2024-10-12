import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.NODE_ENV === 'develop',
  logging: false,
  entities: ["src/database/entities/*.ts"],
  migrations: ["src/database/migrations/**/*.ts"],
  subscribers: [],
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.DB_CA_CERT
  }
})

export const initializeDatabase = async ():Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed", error);
  }
};