import { SvgNmrPeaks } from 'cheminfo-font';

import { Datum1D } from '../../../../data/types/data1d/Datum1D';
import { SpectraTableButtonStyle } from '../SpectraTable';

export interface OnChangeMarkersVisibilityEvent {
  onChangeMarkersVisibility: (data: Datum1D) => void;
}

interface Marker {
  id: string;
}

export type Markers = Array<Marker>;

interface ShowHideMarkersButtonProps extends OnChangeMarkersVisibilityEvent {
  data: Datum1D;
  markersVisible: Markers;
}

export default function ShowHideMarkersButton({
  data,
  onChangeMarkersVisibility,
  markersVisible,
}: ShowHideMarkersButtonProps) {
  const isMarkerVisible = (id) => {
    return markersVisible.findIndex((v) => v.id === id) !== -1;
  };

  if (
    (data.peaks && data.peaks.values.length === 0) ||
    data.info.dimension !== 1
  ) {
    return null;
  }

  return (
    <button
      style={{
        ...SpectraTableButtonStyle,
        opacity: isMarkerVisible(data.id) ? 1 : 0.1,
      }}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChangeMarkersVisibility(data);
      }}
    >
      <SvgNmrPeaks style={{ margin: 'auto' }} />
    </button>
  );
}
