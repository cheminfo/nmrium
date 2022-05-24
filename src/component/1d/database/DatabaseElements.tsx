import { HighlightedSource, useHighlightData } from '../../highlight';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';

import DatabaseSpectrum from './DatabaseSpectrum';
import ResurrectedDatabaseRanges from './ResurrectedDatabaseRanges';

function DatabaseElements() {
  const { highlight } = useHighlightData();
  const { previewJcamp } = usePanelPreferences('database');
  const { jcampURL } = highlight?.sourceData?.extra || {};
  if (highlight.sourceData?.type !== HighlightedSource.DATABASE) {
    return null;
  }

  if (previewJcamp && jcampURL) {
    return <DatabaseSpectrum />;
  }

  return <ResurrectedDatabaseRanges />;
}

export default DatabaseElements;
