import { useEffect } from 'react';

import { useChartData } from '../context/ChartContext.js';
import { useLogger } from '../context/LoggerContext.js';

/**
 * Alert user in UI when state have errorAction (error from reducer)
 */

export function StateError() {
  const { errorAction } = useChartData();
  const { logger } = useLogger();

  useEffect(() => {
    if (!errorAction) return;

    logger.error(errorAction);
  }, [errorAction, logger]);

  return null;
}
