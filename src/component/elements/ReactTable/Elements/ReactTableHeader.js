const ReactTableHeader = ({ headerGroups }) => {
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
};

export default ReactTableHeader;
