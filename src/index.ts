import "reflect-metadata"
import express, { Express, Request, Response } from 'express';
import passport from './config/passport';
import authRoutes from './routes/authRoutes';
import { AppDataSource } from "./data-source"

const app: Express = express();
const port = process.env.PORT || 3000;

AppDataSource.initialize().then(async () => {
  console.log("Data Source has been initialized!")
}).catch(error => console.log(error))

app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Retool API!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});