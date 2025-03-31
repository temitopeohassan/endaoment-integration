import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { Request, Response, NextFunction } from 'express';
import { checkLogin } from './routes/check-login';
import { initLogin } from './routes/init-login';
import { logout } from './routes/logout';
import { verifyLogin } from './routes/verify-login';
import { getDafs } from './routes/get-dafs';
import { getWireInstructions, wireDonation } from './routes/wire-donation';
import { getEnvOrThrow } from './utils/env';
import { createDaf } from './routes/create-daf';
import bodyParser from 'body-parser';
import { grant } from './routes/grant';
import { searchOrganizations } from './routes/search-organizations';

// Create a new express application instance
const app = express();

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('[Request] Headers:', req.headers);
  console.log('[Request] Cookies:', req.cookies);
  console.log('[Request] Body:', req.body);
  next();
});

// Enable CORS with proper configuration
app.use(
  cors({
    origin: getEnvOrThrow('FRONTEND_URL'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  })
);

// Increase payload size limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Add request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    cookies: req.cookies,
  });
  next();
});

// Add response logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const oldJson = res.json;
  res.json = function(data) {
    console.log('[Response]', {
      path: req.path,
      status: res.statusCode,
      data
    });
    return oldJson.call(this, data);
  };
  next();
});

// Set the network port
const port = process.env.PORT || 5454;

// Wrap route handlers with error catching
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// Auth routes
app.get('/', asyncHandler(verifyLogin));
app.get('/check-login', asyncHandler(checkLogin));
app.get('/init-login', asyncHandler(initLogin));
app.post('/logout', asyncHandler(logout));

// DAF routes
app.get('/get-dafs', asyncHandler(getDafs));
app.post('/create-daf', asyncHandler(createDaf));
app.post('/grant', asyncHandler(grant));

// Donation routes
app.get('/wire-donation', asyncHandler(getWireInstructions));
app.post('/wire-donation', asyncHandler(wireDonation));

// Add the new route
app.get('/search-organizations', searchOrganizations);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  
  // Send appropriate error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
