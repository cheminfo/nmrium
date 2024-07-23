import { CSSProperties, Fragment, ReactNode, useState } from 'react';
import { FaFilter, FaRegTrashAlt } from 'react-icons/fa';
import {
  Toolbar,
  ToolbarItemProps as BaseToolbarItemProps,
} from 'react-science/ui';

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

interface CustomToolbarItemProps {
  component: ReactNode;
}

export type ToolbarItemProps = BaseToolbarItemProps | CustomToolbarItemProps;

function isCustomToolbarItem(
  item: ToolbarItemProps,
): item is CustomToolbarItemProps {
  return 'component' in item;
}

interface DefaultPanelHeaderProps {
  total?: number;
  counter?: number;
  deleteToolTip?: string;
  filterToolTip?: string;
  onDelete?: () => void;
  onFilter?: () => void;
  onSettingClick?: () => void;
  disableDelete?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  leftButtons?: ToolbarItemProps[];
  rightButtons?: ToolbarItemProps[];
  hideCounter?: boolean;
}

export function formatCounterLabel(counter?: number, total?: number) {
  if (
    counter !== undefined &&
    total !== undefined &&
    counter >= 0 &&
    total >= 0 &&
    counter !== total
  ) {
    return `[ ${counter}/${total} ]`;
  }

  if (total !== undefined) {
    return `[ ${total} ]`;
  }
  return '';
}

function DefaultPanelHeader(props: DefaultPanelHeaderProps) {
  const {
    total,
    counter,
    onDelete,
    deleteToolTip = 'Delete',
    onFilter,
    filterToolTip = '',
    children,
    onSettingClick,
    disableDelete = false,
    style = {},
    className = '',
    rightButtons = [],
    leftButtons = [],
    hideCounter = false,
  } = props;

  const [isFiltered, setFilterStatus] = useState(false);

  function handleFilter() {
    setFilterStatus((previousValue) => !previousValue);
    onFilter?.();
  }

  return (
    <PanelHeader {...{ style, className }}>
      <div style={styles.leftContainer}>
        <Toolbar>
          {onDelete && (
            <Toolbar.Item
              id="delete-button"
              onClick={onDelete}
              tooltip={deleteToolTip}
              icon={<FaRegTrashAlt />}
              intent="danger"
              disabled={!total || disableDelete}
            />
          )}

          {onFilter && (
            <Toolbar.Item
              id="filter-button"
              onClick={handleFilter}
              tooltip={filterToolTip}
              active={isFiltered}
              icon={<FaFilter />}
            />
          )}
          {mapToolbarButtons(leftButtons)}
        </Toolbar>
        {children}
      </div>

      <Toolbar>{mapToolbarButtons(rightButtons)}</Toolbar>
      {!hideCounter && (
        <CounterLabel value={formatCounterLabel(counter, total)} />
      )}
      {onSettingClick && (
        <PreferencesButton tooltip="Preferences" onClick={onSettingClick} />
      )}
    </PanelHeader>
  );
}

function mapToolbarButtons(buttons: ToolbarItemProps[]) {
  return buttons.map((props, index) =>
    isCustomToolbarItem(props) ? (
      // eslint-disable-next-line react/no-array-index-key
      <Fragment key={`${index}`}>{props.component}</Fragment>
    ) : (
      <Toolbar.Item key={props?.id || `${index}`} {...props} />
    ),
  );
}

export default DefaultPanelHeader;
