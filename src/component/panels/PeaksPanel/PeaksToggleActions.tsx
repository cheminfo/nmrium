import { SvgNmrPeaks, SvgNmrPeaksTopLabels } from 'cheminfo-font';
import { Toolbar, ToolbarItemProps } from 'react-science/ui';

interface PeaksToggleProps {
  disabled: boolean;
  displayingMode: 'single' | 'spread';
  showPeaks: boolean;
  onShowToggle: ToolbarItemProps['onClick'];
  onDisplayingModeToggle: ToolbarItemProps['onClick'];
}

export function PeaksToggleActions(props: PeaksToggleProps) {
  const {
    disabled,
    displayingMode,
    showPeaks,
    onShowToggle,
    onDisplayingModeToggle,
  } = props;

  return (
    <>
      <Toolbar.Item
        disabled={disabled}
        icon={<SvgNmrPeaks />}
        title={showPeaks ? 'Hide peaks' : 'Show peaks'}
        onClick={onShowToggle}
        active={showPeaks}
      />
      <Toolbar.Item
        disabled={disabled}
        icon={<SvgNmrPeaksTopLabels />}
        title={displayingMode === 'spread' ? 'Single Mode' : 'Spread mode'}
        onClick={onDisplayingModeToggle}
        active={displayingMode === 'spread'}
      />
    </>
  );
}
