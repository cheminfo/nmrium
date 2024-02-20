import { CSSProperties, ReactNode, useState } from 'react';

import { CounterLabel } from '../../elements/CounterLabel';
import { DeleteButton } from '../../elements/DeleteButton';
import { FilterButton } from '../../elements/FilterButton';
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
  const [isFiltered, setFilterStatus] = useState(false);

  function handleFilter() {
    setFilterStatus((previousValue) => !previousValue);
    onFilter();
  }

  return (
    <PanelHeader {...{ style, className }}>
      <div style={styles.leftContainer}>
        {canDelete && (
          <DeleteButton
            disabled={counter === 0 || disableDelete}
            title={deleteToolTip}
            onClick={onDelete}
          />
        )}

        {/* Optional if there is no filter needed, e.g. in spectra panel */}
        {filterToolTip && (
          <FilterButton
            onClick={handleFilter}
            active={isFiltered}
            title={filterToolTip}
          />
        )}
        {children}
      </div>
      {renderRightButtons?.()}
      {counterLabel && <CounterLabel>{counterLabel}</CounterLabel>}
      {showSettingButton && <PreferencesButton onClick={onSettingClick} />}
    </PanelHeader>
  );
}

export default DefaultPanelHeader;
