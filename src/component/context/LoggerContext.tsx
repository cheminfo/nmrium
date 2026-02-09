import type { ChangeEvent, LogEntry } from 'fifo-logger';
import { FifoLogger } from 'fifo-logger';
import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { LogsHistoryModal } from '../modal/LogsHistoryModal.js';

import { usePreferences } from './PreferencesContext.js';

const LoggerContext = createContext<{
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

export type LoggerType =
  | 'fatal'
  | 'error'
  | 'warn'
  | 'info'
  | 'debug'
  | 'trace'
  | 'silent';

export const LOGGER_LEVELS = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
  silent: 0,
} as const;

export function LoggerProvider({ children }: LoggerProviderProps) {
  const {
    current: {
      general: { loggingLevel, popupLoggingLevel },
    },
  } = usePreferences();
  const [lastReadLogId, setLastLogId] = useState(0);
  const [logsHistory, setLogsHistory] = useState<LogEntry[]>([]);
  const [isLogHistoryOpened, openLogHistory] = useState(false);
  const popupLoggingLevelRef = useRef<LogEntry['levelLabel']>();
  const [logger] = useState(() => new FifoLogger());

  useEffect(() => {
    function handleLogger({ detail: { logs } }: ChangeEvent) {
      const log = logs.at(-1);
      if (
        log &&
        popupLoggingLevelRef.current &&
        log.level === LOGGER_LEVELS[popupLoggingLevelRef.current]
      ) {
        openLogHistory(true);
      }
      if (log?.error) {
        // eslint-disable-next-line no-console
        console.error(log.error);
      }
      setLogsHistory(logs.slice());
    }

    logger.addEventListener('change', handleLogger);
    return () => {
      logger.removeEventListener('change', handleLogger);
    };
  }, [logger]);

  useEffect(() => {
    if (loggingLevel) {
      logger.setLevel(loggingLevel);
    }
  }, [logger, loggingLevel]);

  const markAsRead = useCallback(() => {
    if (logsHistory.length > 0) {
      const id = (logsHistory.at(-1) as LogEntry).id;
      setLastLogId(id);
    }
  }, [logsHistory]);

  const loggerState = useMemo(() => {
    return {
      logger,
      logsHistory,
      markAsRead,
      lastReadLogId,
    };
  }, [logger, lastReadLogId, logsHistory, markAsRead]);

  useEffect(() => {
    popupLoggingLevelRef.current = popupLoggingLevel;
  }, [logsHistory, popupLoggingLevel]);

  return (
    <LoggerContext.Provider value={loggerState}>
      {isLogHistoryOpened && (
        <LogsHistoryModal autoOpen onClose={() => openLogHistory(false)} />
      )}
      {children}
    </LoggerContext.Provider>
  );
}
