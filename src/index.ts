import "reflect-metadata"
import dotenv from 'dotenv'
import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
import flash from 'connect-flash';
import passport from './config/passport';
import authRoutes from './routes/authRoutes';
import { swaggerSpec } from './config/swagger';
import { initializeDatabase } from './config/db';
import { ensureAuthenticated } from "./middlewares/helpers";

dotenv.config()
initializeDatabase();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(flash());
app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 1, // 1 hour
      secure: process.env.NODE_ENV === 'production',// Set to true for HTTPS
      sameSite: 'lax',
      httpOnly: true, // HttpOnly cookies protect against XSS attacks
    },
  })
);
app.use(passport.session());


// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/auth', authRoutes);

app.get('/api', ensureAuthenticated, (req, res) => {
  res.json({ message: 'authenticated api' });
});
app.get('/error', (req, res) => {
  res.status(401).send(req.flash('error'));
});

app.get('/', (req, res) => {
  res.send('Hello, Retool API!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
});