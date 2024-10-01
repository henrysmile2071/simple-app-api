import "reflect-metadata"
import dotenv from 'dotenv'
import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
// import passport from './config/passport';
// import authRoutes from './routes/authRoutes';
import { AppDataSource } from "./data-source"
import { swaggerSpec } from './config/swagger';

dotenv.config()

const app: Express = express();
const port = process.env.PORT || 3000;

AppDataSource.initialize().then(async () => {
  console.log("Data Source has been initialized!")
}).catch(error => console.log(error))


app.use(express.json());
// app.use(passport.initialize());

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