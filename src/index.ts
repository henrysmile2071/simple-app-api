import "reflect-metadata"
import dotenv from 'dotenv'
import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
import passport from './config/passport';
// import authRoutes from './routes/authRoutes';
import { swaggerSpec } from './config/swagger';
import { initializeDatabase } from './config/db';

dotenv.config()

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
}));

initializeDatabase();

app.use(passport.initialize());

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
// app.use('/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Retool API!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
});