import { Request, Response, NextFunction } from 'express';

const ensureAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You need to be logged in to access this page.');
  res.status(401).send('Unauthorized');
  res.redirect('/auth/login');
};

export { ensureAuthenticated };
