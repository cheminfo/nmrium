import { FifoLogger, LogEntry } from 'fifo-logger';
import {
  createContext,
  useContext,
  ReactNode,
  useRef,
  useMemo,
  useState,
} from 'react';

export const LoggerContext = createContext<{
  logger: FifoLogger;
  logsHistory: LogEntry[];
} | null>(null);

export function useLogger() {
  const context = useContext(LoggerContext);
  if (!context) {
    throw new Error('Logger context was not found');
  }

  return context;
}

interface LoggerProviderProps {
  children: ReactNode;
}

export function LoggerProvider({ children }: LoggerProviderProps) {
  const [logsHistory, setLogsHistory] = useState<LogEntry[]>([]);
  const loggerRef = useRef<FifoLogger>(
    new FifoLogger({
      onChange: (log, logs) => {
        setLogsHistory(logs.slice());
      },
    }),
  );

  const loggerState = useMemo(() => {
    return { logger: loggerRef.current, logsHistory };
  }, [logsHistory]);

  return (
    <LoggerContext.Provider value={loggerState}>
      {children}
    </LoggerContext.Provider>
  );
}
