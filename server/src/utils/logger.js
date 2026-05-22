const stamp = () => new Date().toISOString();

module.exports = {
  info: (message, meta = "") => console.log(`[${stamp()}] INFO: ${message}`, meta),
  warn: (message, meta = "") => console.warn(`[${stamp()}] WARN: ${message}`, meta),
  error: (message, meta = "") => console.error(`[${stamp()}] ERROR: ${message}`, meta)
};

