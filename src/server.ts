import { app } from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  /* eslint-enable no-console */
});

