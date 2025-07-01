const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * DEVSERVER PROXY CONFIG
 * Forwards API calls from React devserver (port 3000) to backend (port 4000).
 * This ensures fetch('/api/...') works during development.
 */
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      // Optionally log debug info:
      logLevel: 'warn'
    })
  );
  // Optionally forward uploads/media if stored on backend
  // app.use(
  //   '/uploads',
  //   createProxyMiddleware({
  //     target: 'http://localhost:3001',
  //     changeOrigin: true,
  //     logLevel: 'warn'
  //   })
  // );
};
