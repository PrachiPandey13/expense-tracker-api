import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { z } from 'zod';

import authRoutes from './routes/auth';
import expensesRoutes from './routes/expenses';

const port = process.env.PORT || 8000;

const app: Express = express();

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(bodyParser.json());

app.get('/', (_req: Request, res: Response) => {
  return res.status(200).json({ ok: true, service: 'expense-tracker-api' });
});

app.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({ ok: true });
});

app.use('/auth', authRoutes);
app.use('/expenses', expensesRoutes);

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);

  if (error instanceof z.ZodError) {
    return res.status(422).json({
      message: 'Validation failed.',
      errors: error.errors,
    });
  }

  const status = error.statusCode || 500;
  const message = error.message || 'An internal server error occurred.';
  return res.status(status).json({ message });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
