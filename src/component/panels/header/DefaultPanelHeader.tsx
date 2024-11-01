import type { CSSProperties, ReactNode } from 'react';
import { Fragment, useState } from 'react';
import { FaFilter, FaRegTrashAlt } from 'react-icons/fa';
import type { ToolbarItemProps as BaseToolbarItemProps } from 'react-science/ui';
import { PanelHeader, Toolbar } from 'react-science/ui';

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
    <PanelHeader
      {...{ style, className }}
      onClickSettings={onSettingClick}
      current={hideCounter ? undefined : counter}
      total={hideCounter ? undefined : total}
    >
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
