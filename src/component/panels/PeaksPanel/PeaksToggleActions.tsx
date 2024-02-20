import { SvgNmrPeaks, SvgNmrPeaksTopLabels } from 'cheminfo-font';
import { Toolbar, ToolbarItemProps } from 'react-science/ui';

interface PeaksToggleProps {
  disabled: boolean;
  toggleDisplayingMode: 'single' | 'spread';
  toggleDisplayingModeId?: string;
  togglePeaks: boolean;
  togglePeaksId?: string;
  onShowToggle: ToolbarItemProps['onClick'];
  onDisplayingModeToggle: ToolbarItemProps['onClick'];
}

export function PeaksToggleActions(props: PeaksToggleProps) {
  const {
    disabled,
    togglePeaks,
    togglePeaksId,
    toggleDisplayingMode,
    toggleDisplayingModeId,
    onShowToggle,
    onDisplayingModeToggle,
  } = props;

  return (
    <>
      <Toolbar.Item
        id={togglePeaksId}
        disabled={disabled}
        icon={<SvgNmrPeaks />}
        title={`${togglePeaks ? 'Hide' : 'Show'} peaks`}
        onClick={onShowToggle}
        active={togglePeaks}
      />
      <Toolbar.Item
        id={toggleDisplayingModeId}
        disabled={disabled}
        icon={<SvgNmrPeaksTopLabels />}
        title={
          toggleDisplayingMode === 'spread' ? 'Single Mode' : 'Spread mode'
        }
        onClick={onDisplayingModeToggle}
        active={toggleDisplayingMode === 'spread'}
      />
    </>
  );
}
