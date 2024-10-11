import dotenv from 'dotenv'
dotenv.config();
import app from './app.js';
import { initializeDatabase } from './config/db.js';

const port = process.env.PORT || 3000;
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
  });
});