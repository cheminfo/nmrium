import {
  HighlightEventSource,
  useHighlightData,
} from '../../highlight/index.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';

import DatabaseSpectrum from './DatabaseSpectrum.js';
import ResurrectedDatabaseRanges from './ResurrectedDatabaseRanges.js';

function DatabaseElements() {
  const { highlight } = useHighlightData();
  const { previewJcamp } = usePanelPreferences('database');
  const { jcampURL } = highlight?.sourceData?.extra || {};
  if (highlight.sourceData?.type !== HighlightEventSource.DATABASE) {
    return null;
  }

  if (previewJcamp && jcampURL) {
    return <DatabaseSpectrum />;
  }

  return <ResurrectedDatabaseRanges />;
}

export default DatabaseElements;
