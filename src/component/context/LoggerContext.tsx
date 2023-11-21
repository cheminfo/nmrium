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

import { LogsHistoryModal } from '../modal/LogsHistoryModal';

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
  const [isLogHistoryOpened, openLogHistory] = useState(false);

  const loggerRef = useRef<FifoLogger>(
    new FifoLogger({
      onChange: (log, logs) => {
        if (log && ['error', 'fatal'].includes(log.levelLabel)) {
          //open the log history automatically if we have error or fatal
          openLogHistory(true);

          if (log?.error) {
            // eslint-disable-next-line no-console
            console.error(log.error);
          }
        }
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
      const id = (logsHistory.at(-1) as LogEntry).id;
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
      {isLogHistoryOpened && (
        <LogsHistoryModal autoOpen onClose={() => openLogHistory(false)} />
      )}
      {children}
    </LoggerContext.Provider>
  );
}
