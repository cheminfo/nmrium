interface ReactTableheaderProps {
  headerGroups: any;
}

export default function ReactTableHeader({
  headerGroups,
}: ReactTableheaderProps) {
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
