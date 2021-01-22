import { SvgNmrPeaks } from 'cheminfo-font';
import React from 'react';

function ShowHideMarkersButton({
  data,
  onChangeMarkersVisibility,
  markersVisible,
  style,
}) {
  const isMarkerVisible = (id) => {
    return markersVisible.findIndex((v) => v.id === id) !== -1 ? true : false;
  };

  return (
    <button
      style={{
        ...style,
        opacity:
          isMarkerVisible(data.id) && data.peaks && data.peaks.values.length > 0
            ? 1
            : 0.1,
      }}
      type="button"
      onClick={() => onChangeMarkersVisibility(data)}
      disabled={data.peaks && data.peaks.values.length === 0}
    >
      <SvgNmrPeaks />
    </button>
  );
}

export default ShowHideMarkersButton;
