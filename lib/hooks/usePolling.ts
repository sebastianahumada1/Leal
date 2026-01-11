import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  interval?: number; // Intervalo en milisegundos
  enabled?: boolean; // Si el polling está habilitado
}

/**
 * Hook personalizado para polling
 * @param callback Función a ejecutar en cada intervalo
 * @param options Opciones de configuración
 */
export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions = {}
) {
  const { interval = 5000, enabled = true } = options;
  const callbackRef = useRef(callback);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Actualizar referencia del callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Función que ejecuta el callback
  const execute = useCallback(async () => {
    try {
      await callbackRef.current();
    } catch (error) {
      console.error('Error en polling:', error);
    }
  }, []);

  // Configurar polling
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Ejecutar inmediatamente
    execute();

    // Configurar intervalo
    intervalRef.current = setInterval(execute, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [execute, interval, enabled]);

  // Retornar función para detener manualmente
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { stop };
}
