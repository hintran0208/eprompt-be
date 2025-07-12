import generateRoute from './generate';
import refineRoute from './refine';
import searchRoute from './search';
import aiGenerateRoute from './ai-generate';
import templateRoute from './template';

export default function registerRoutes(app: import('express').Express) {
  app.use('/generate', generateRoute);
  app.use('/refine', refineRoute);
  app.use('/search', searchRoute);
  app.use('/ai-generate', aiGenerateRoute);
  app.use('/template', templateRoute);
}
