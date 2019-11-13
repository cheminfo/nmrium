import React, { useState } from 'react';

import {
  Table,
  TableHead,
  //   TableBody,
  TableRow,
  TableCell,
} from '../elements/Table';
import { useChartData } from '../context/ChartContext';

import NoTableData from './placeholder/NoTableData';

const RangesTablePanel = () => {
  //   const [ranges, setRanges] = useState([]);
  const [ranges] = useState([]); // to replace by line above
  const { activeSpectrum, data } = useChartData();

  return activeSpectrum && data && ranges.length > 0 ? (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">From</TableCell>
            <TableCell align="center">To</TableCell>
            <TableCell align="center">Range</TableCell>
          </TableRow>
        </TableHead>
        {/* <TableBody /> */}
      </Table>
    </>
  ) : (
    <NoTableData />
  );
};

export default RangesTablePanel;
