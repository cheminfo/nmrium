import { CSSProperties, ReactNode, useState } from 'react';
import { FaFilter, FaRegTrashAlt } from 'react-icons/fa';
import { Toolbar, ToolbarItemProps } from 'react-science/ui';

import { CounterLabel } from '../../elements/CounterLabel';
import { PreferencesButton } from '../../elements/PreferencesButton';

import PanelHeader from './PanelHeader';

const styles: Record<'leftContainer', CSSProperties> = {
  leftContainer: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
};

interface DefaultPanelHeaderProps {
  counter?: number;
  counterLabel?: string;
  deleteToolTip?: string;
  filterToolTip?: string;
  onDelete?: () => void;
  onFilter?: () => void;
  onSettingClick?: ToolbarItemProps['onClick'];
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
  const [isFiltered, setFilterStatus] = useState(false);

  function handleFilter() {
    setFilterStatus((previousValue) => !previousValue);
    onFilter();
  }

  return (
    <PanelHeader {...{ style, className }}>
      <div style={styles.leftContainer}>
        <Toolbar>
          {canDelete && (
            <Toolbar.Item
              id="delete-button"
              onClick={onDelete}
              title={deleteToolTip}
              icon={<FaRegTrashAlt />}
              intent="danger"
              disabled={counter === 0 || disableDelete}
            />
          )}

          {/* Optional if there is no filter needed, e.g. in spectra panel */}
          {filterToolTip && (
            <Toolbar.Item
              id="filter-button"
              onClick={handleFilter}
              active={isFiltered}
              title={filterToolTip}
              icon={<FaFilter />}
            />
          )}
        </Toolbar>
        {children}
      </div>
      {renderRightButtons?.()}
      {counterLabel && <CounterLabel>{counterLabel}</CounterLabel>}
      {showSettingButton && (
        <PreferencesButton title="Preferences" onClick={onSettingClick} />
      )}
    </PanelHeader>
  );
}

export default DefaultPanelHeader;
