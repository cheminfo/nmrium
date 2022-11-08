import { CSSProperties } from 'react';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

interface ReactTableHeaderProps {
  headerGroups: any;
}

const sortIconStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  left: '2px',
};

function ReactTableHeader({ headerGroups }: ReactTableHeaderProps) {
  return (
    <thead>
      {headerGroups.map((headerGroup) => {
        const { key: headerGroupKey, ...restHeaderGroupProps } =
          headerGroup.getHeaderGroupProps();
        return (
          <tr key={headerGroupKey} {...restHeaderGroupProps}>
            {headerGroup.headers.map((column) => {
              const {
                key: headerKey,
                style: headerStyle,
                ...restHeaderProps
              } = column.getHeaderProps(column.getSortByToggleProps());
              return (
                <th
                  key={headerKey}
                  {...restHeaderProps}
                  style={{ ...headerStyle, ...column.style, height: '1px' }}
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
            })}
          </tr>
        );
      })}
    </thead>
  );
}

export default ReactTableHeader;
