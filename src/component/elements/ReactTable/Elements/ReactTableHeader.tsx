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
      {headerGroups.map((headerGroup) => (
        <tr
          key={headerGroup.getHeaderGroupProps().key}
          {...headerGroup.getHeaderGroupProps()}
        >
          {headerGroup.headers.map((column) => (
            <th
              key={column.getHeaderProps().key}
              {...column.getHeaderProps(column.getSortByToggleProps())}
              style={{ ...column.style, height: '1px' }}
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
          ))}
        </tr>
      ))}
    </thead>
  );
}

export default ReactTableHeader;
