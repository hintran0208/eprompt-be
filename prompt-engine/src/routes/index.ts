import generateRoute from './generate';
import refineRoute from './refine';
import templateRoute from './template';

export default function registerRoutes(app: import('express').Express) {
  app.use('/generate', generateRoute);
  app.use('/refine', refineRoute);
  app.use('/template', templateRoute);
}
