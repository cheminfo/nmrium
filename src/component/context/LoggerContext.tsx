import { FifoLogger, LogEntry } from 'fifo-logger';
import {
  createContext,
  useContext,
  ReactNode,
  useRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';

import { usePreferences } from './PreferencesContext';

export const LoggerContext = createContext<{
  logger: FifoLogger;
  logsHistory: LogEntry[];
  markAsRead: () => void;
  lastReadLogId: number;
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
  const {
    current: {
      general: { loggingLevel },
    },
  } = usePreferences();
  const [lastReadLogId, setLastLogId] = useState(0);
  const [logsHistory, setLogsHistory] = useState<LogEntry[]>([]);
  const loggerRef = useRef<FifoLogger>(
    new FifoLogger({
      onChange: (log, logs) => {
        setLogsHistory(logs.slice());
      },
    }),
  );

  useEffect(() => {
    if (loggingLevel) {
      loggerRef.current.setLevel(loggingLevel);
    }
  }, [loggingLevel]);

  const markAsRead = useCallback(() => {
    if (logsHistory.length > 0) {
      const id = logsHistory[logsHistory.length - 1].id;
      setLastLogId(id);
    }
  }, [logsHistory]);

  const loggerState = useMemo(() => {
    return {
      logger: loggerRef.current,
      logsHistory,
      markAsRead,
      lastReadLogId,
    };
  }, [lastReadLogId, logsHistory, markAsRead]);

  return (
    <LoggerContext.Provider value={loggerState}>
      {children}
    </LoggerContext.Provider>
  );
}