import express from 'express';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
import flash from 'connect-flash';
import passport from './config/passport';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import { ensureAuthenticated } from '@middlewares/helpers';

const app = express();

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
