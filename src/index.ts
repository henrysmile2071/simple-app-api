import dotenv from 'dotenv'
import app from './app';
import { initializeDatabase } from '@config/db';

dotenv.config()

const port = process.env.PORT || 3000;
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
  });
});