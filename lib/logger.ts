/**
 * LOGGER: Utility para logging condicional
 * En producción, los logs se deshabilitan automáticamente
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Siempre mostrar errores, incluso en producción
    console.error(...args);
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

// Helper para prefijos de features
export const createLogger = (prefix: string) => ({
  log: (...args: any[]) => logger.log(`[${prefix}]`, ...args),
  error: (...args: any[]) => logger.error(`[${prefix}]`, ...args),
  warn: (...args: any[]) => logger.warn(`[${prefix}]`, ...args),
  info: (...args: any[]) => logger.info(`[${prefix}]`, ...args),
  debug: (...args: any[]) => logger.debug(`[${prefix}]`, ...args),
});
