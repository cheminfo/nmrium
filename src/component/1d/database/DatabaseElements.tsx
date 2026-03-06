import {
  isHighlightEventSource,
  useHighlightData,
} from '../../highlight/index.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';

import DatabaseSpectrum from './DatabaseSpectrum.js';
import ResurrectedDatabaseRanges from './ResurrectedDatabaseRanges.js';

function DatabaseElements() {
  const {
    highlight: { sourceData },
  } = useHighlightData();
  const { previewJcamp } = usePanelPreferences('database');
  if (!sourceData || !isHighlightEventSource(sourceData, 'DATABASE')) {
    return null;
  }
  const { jcampURL } = sourceData.extra || {};

  if (previewJcamp && jcampURL) {
    return <DatabaseSpectrum />;
  }

  return <ResurrectedDatabaseRanges />;
}

export default DatabaseElements;
