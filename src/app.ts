import express from 'express';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
import flash from 'connect-flash';
import passport from './config/passport.js';
import { swaggerSpec } from './config/swagger.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { ensureAuthenticated } from './middlewares/helpers.js';

const app = express();
//set trust proxy to true in production, such as in Heroku: https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', process.env.NODE_ENV === 'production');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 1, // 1 hour
      secure: process.env.NODE_ENV === 'production', // Set to true for HTTPS
      sameSite: 'lax',
      httpOnly: true, // HttpOnly cookies protect against XSS attacks
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/auth', authRoutes);
app.use('/users', ensureAuthenticated, userRoutes);
app.get('/error', (req, res) => {
  res.status(401).send(req.flash('error'));
});
app.get('/login', (req, res) => {
  res.redirect(process.env.LOGIN_PAGE_URL!);
});
app.get('/home', (req, res) => {
  res.redirect(process.env.HOME_PAGE_URL!);
});

export default app;
