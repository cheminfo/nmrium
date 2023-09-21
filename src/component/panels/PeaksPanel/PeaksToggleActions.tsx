import { SvgNmrPeaks, SvgNmrPeaksTopLabels } from 'cheminfo-font';
import { CSSProperties } from 'react';

import ActiveButton, { ActiveButtonProps } from '../../elements/ActiveButton';

interface PeaksToggleProps {
  disbale: boolean;
  displayingMode: 'single' | 'spread';
  showPeaks: boolean;
  onShowToggle: ActiveButtonProps['onClick'];
  onDisplayingModeToggle: ActiveButtonProps['onClick'];
}

const style: CSSProperties = {
  margin: '0 2px',
};
export function PeaksToggleActions(props: PeaksToggleProps) {
  const {
    disbale,
    displayingMode,
    showPeaks,
    onShowToggle,
    onDisplayingModeToggle,
  } = props;

  return (
    <>
      <ActiveButton
        style={style}
        popupTitle={showPeaks ? 'Hide peaks' : 'Show peaks'}
        popupPlacement="right"
        onClick={onShowToggle}
        disabled={disbale}
        value={showPeaks}
      >
        <SvgNmrPeaks style={{ pointerEvents: 'none', fontSize: '12px' }} />
      </ActiveButton>
      <ActiveButton
        style={style}
        popupTitle={displayingMode === 'spread' ? 'Single Mode' : 'Spread mode'}
        popupPlacement="right"
        onClick={onDisplayingModeToggle}
        disabled={disbale}
        value={displayingMode === 'spread'}
      >
        <SvgNmrPeaksTopLabels
          style={{ pointerEvents: 'none', fontSize: '12px' }}
        />
      </ActiveButton>
    </>
  );
}
