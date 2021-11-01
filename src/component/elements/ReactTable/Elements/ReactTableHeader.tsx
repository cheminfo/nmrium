import { memo } from 'react';

interface ReactTableHeaderProps {
  headerGroups: any;
}

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
              style={column.style}
            >
              {column.render('Header')}
              <span>
                {column.isSorted ? (column.isSortedDesc ? ' ▼' : ' ▲') : ''}
              </span>
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}

export default memo(ReactTableHeader);
