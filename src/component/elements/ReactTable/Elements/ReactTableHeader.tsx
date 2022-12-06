import { CSSProperties, MouseEvent } from 'react';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

interface TableCellEvent {
  onClick: (e: MouseEvent<HTMLTableCellElement>) => void;
}
interface ReactTableHeaderProps extends TableCellEvent {
  headerGroups: any;
}

const sortIconStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  left: '2px',
};

function ReactTableHeader({ headerGroups, onClick }: ReactTableHeaderProps) {
  return (
    <thead>
      {headerGroups.map((headerGroup) => {
        const { key: headerGroupKey, ...restHeaderGroupProps } =
          headerGroup.getHeaderGroupProps();
        return (
          <tr key={headerGroupKey} {...restHeaderGroupProps}>
            {headerGroup.headers.map((column) => (
              <HeaderCell key={column.key} column={column} onClick={onClick} />
            ))}
          </tr>
        );
      })}
    </thead>
  );
}

interface HeaderCellProps extends TableCellEvent {
  column: any;
}

const HeaderCell = (props: HeaderCellProps) => {
  const { column } = props;
  const {
    key: headerKey,
    style: headerStyle,
    onClick,
    ...restHeaderProps
  } = column.getHeaderProps(column.getSortByToggleProps());
  function clickHandler(e: MouseEvent<HTMLTableCellElement>) {
    if (onClick) {
      onClick(e);
      props.onClick(e);
    }
  }
  return (
    <th
      key={headerKey}
      {...restHeaderProps}
      style={{ ...headerStyle, ...column.style, height: '1px' }}
      onClick={clickHandler}
    >
      <span style={sortIconStyle}>
        {column.isSorted ? (
          column.isSortedDesc ? (
            <FaSortAmountDown />
          ) : (
            <FaSortAmountUp />
          )
        ) : (
          ''
        )}
      </span>
      {column.render('Header') && column.render('Header')}
    </th>
  );
};

export default ReactTableHeader;
