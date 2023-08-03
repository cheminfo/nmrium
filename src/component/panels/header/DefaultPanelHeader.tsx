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
    padding: '0 10px',
    whiteSpace: 'nowrap',
  },
};

interface DefaultPanelHeaderProps {
  counter?: number;
  counterFiltered?: number;
  deleteToolTip?: string;
  filterToolTip?: string;
  onDelete?: () => void;
  onFilter?: () => void;
  onSettingClick?: () => void;
  filterIsActive?: boolean;
  canDelete?: boolean;
  disableDelete?: boolean;
  showSettingButton?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  renderRightButtons?: () => ReactNode;
}

function DefaultPanelHeader({
  counter,
  onDelete = () => null,
  deleteToolTip = 'Delete',
  onFilter = () => null,
  filterToolTip = '',
  filterIsActive = false,
  counterFiltered = 0,
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
            defaultValue={filterIsActive}
          >
            <FaFilter style={{ pointerEvents: 'none', fontSize: '12px' }} />
          </ToggleButton>
        ) : null}

        {children}
      </div>
      {renderRightButtons?.()}
      {counter !== undefined && (
        <p style={styles.counterLabel}>
          [{' '}
          {filterIsActive && counterFiltered !== undefined
            ? `${counterFiltered}/${counter}`
            : counter}{' '}
          ]
        </p>
      )}
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
