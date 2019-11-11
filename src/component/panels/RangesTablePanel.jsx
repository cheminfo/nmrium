import React, { useState, useCallback, useEffect } from 'react';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../elements/Table';
import { useChartData } from '../context/ChartContext';

import NoTableData from './placeholder/NoTableData';

const RangesTablePanel = () => {
  const [ranges, setRanges] = useState([]);
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
        <TableBody>
          {/* {matches.map((key) => (
              <TableRow key={key} className="Information">
                <TableCell size={3} align="left">
                  {key}
                </TableCell>
                <TableCell size={9} align="left" style={{ paddingLeft: 5 }}>
                  {`${information[key]}`}
                </TableCell>
              </TableRow>
            ))} */}
        </TableBody>
      </Table>
    </>
  ) : (
    <NoTableData />
  );
};

export default RangesTablePanel;
