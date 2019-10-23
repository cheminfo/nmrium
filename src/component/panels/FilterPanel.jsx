import React, { useMemo } from 'react';
import ReactJson from 'react-json-view';

import {
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
} from '../elements/Table';
import { useChartData } from '../context/ChartContext';

const FilterPanel = () => {
  const { data, activeSpectrum } = useChartData();

  const filtersTableRow = useMemo(() => {
    const Filters =
      data &&
      activeSpectrum &&
      data.find((d) => d.id === activeSpectrum.id).filters;

    return (
      Filters &&
      Filters.map((d, i) => (
        <TableRow key={d.kind + i}>
          <TableCell align="center" size="1">
            {d.kind}
          </TableCell>
          <TableCell align="left" size="3">
            <ReactJson
              name={false}
              iconStyle="circle"
              collapsed={true}
              displayDataTypes={false}
              src={d}
            />
          </TableCell>
        </TableRow>
      ))
    );
  }, [activeSpectrum, data]);

  return filtersTableRow && filtersTableRow.length > 0 ? (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell align="center" size="1">
            Label
          </TableCell>
          <TableCell align="center" size="2">
            Properties
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>{filtersTableRow}</TableBody>
    </Table>
  ) : (
    <p
      style={{
        textAlign: 'center',
        width: '100%',
        fontSize: '11px',
        padding: '5px',
        color: 'gray',
      }}
    >
      No Data
    </p>
  );
};

export default FilterPanel;
