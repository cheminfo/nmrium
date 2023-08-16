import { CSSProperties, ReactNode } from 'react';
import { FaRegTrashAlt, FaCog, FaFilter } from 'react-icons/fa';

import Button from '../../elements/Button';
import ToggleButton from '../../elements/ToggleButton';
import ToolTip from '../../elements/ToolTip/ToolTip';

import PanelHeader from './PanelHeader';

const styles: Record<'leftContainer' | 'counterLabel', CSSProperties> = {
  leftContainer: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  counterLabel: {
    margin: 0,
    textAlign: 'right',
    lineHeight: '22px',
    padding: '0 5px',
    whiteSpace: 'nowrap',
  },
};

interface DefaultPanelHeaderProps {
  counter?: number;
  counterLabel?: string;
  deleteToolTip?: string;
  filterToolTip?: string;
  onDelete?: () => void;
  onFilter?: () => void;
  onSettingClick?: () => void;
  canDelete?: boolean;
  disableDelete?: boolean;
  showSettingButton?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  renderRightButtons?: () => ReactNode;
}

export function createFilterLabel(total: number, counter: number | false) {
  if (typeof counter === 'boolean') {
    return `[ ${total || 0} ]`;
  }
  return `[ ${counter}/${total} ]`;
}

function DefaultPanelHeader({
  counter,
  counterLabel,
  onDelete = () => null,
  deleteToolTip = 'Delete',
  onFilter = () => null,
  filterToolTip = '',
  children,
  onSettingClick = () => null,
  showSettingButton = false,
  canDelete = true,
  disableDelete = false,
  style = {},
  className = '',
  renderRightButtons,
}: DefaultPanelHeaderProps) {
  return (
    <PanelHeader {...{ style, className }}>
      <div style={styles.leftContainer}>
        {canDelete && (
          <Button.BarButton
            color={{ base: 'black', hover: 'red' }}
            onClick={onDelete}
            disabled={counter === 0 || disableDelete}
            toolTip={deleteToolTip}
            tooltipOrientation="horizontal"
          >
            <FaRegTrashAlt />
          </Button.BarButton>
        )}

        {/* Optional if there is no filter needed, e.g. in spectra panel */}
        {filterToolTip ? (
          <ToggleButton
            popupTitle={filterToolTip}
            popupPlacement="right"
            onClick={onFilter}
          >
            <FaFilter style={{ pointerEvents: 'none', fontSize: '12px' }} />
          </ToggleButton>
        ) : null}

        {children}
      </div>
      {renderRightButtons?.()}
      {counterLabel && <p style={styles.counterLabel}>{counterLabel}</p>}
      {showSettingButton && (
        <ToolTip title="Preferences" popupPlacement="left">
          <button type="button" onClick={onSettingClick}>
            <FaCog />
          </button>
        </ToolTip>
      )}
    </PanelHeader>
  );
}

export default DefaultPanelHeader;
