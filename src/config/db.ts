import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "../entities/User.js"

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, //TODO: for production, use migrations
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
  ssl: {
    rejectUnauthorized: true,
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