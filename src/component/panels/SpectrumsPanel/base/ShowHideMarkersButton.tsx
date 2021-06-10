import { SvgNmrPeaks } from 'cheminfo-font';
import { CSSProperties } from 'react';

interface DataProps {
  id: string;
  peaks: {
    values: Array<any>;
  };
}

interface MarkersProps {
  id: string;
}

interface ShowHideMarkersButtonProps {
  style: CSSProperties;
  data: DataProps;
  onChangeMarkersVisibility: (data: DataProps) => void;
  markersVisible: Array<MarkersProps>;
}

export default function ShowHideMarkersButton({
  data,
  onChangeMarkersVisibility,
  markersVisible,
  style,
}: ShowHideMarkersButtonProps) {
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
