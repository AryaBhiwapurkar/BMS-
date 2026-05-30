const logger = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;

  // Override res.send to always log
  res.send = function (data) {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
    return originalSend.call(this, data);
  };

  // Also catch finish event as backup
  res.on("finish", () => {
    if (!res.headersSent) return; // Only log if not already logged
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });

  next();
};

export default logger;