import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (data && activeSpectrum) {
      const activeSpectrumData = data.find((d) => d.id === activeSpectrum.id);
      if (activeSpectrumData) {
        setRanges(activeSpectrumData.ranges);
      } else {
        setRanges({});
      }
    }
  }, [activeSpectrum, data]);

  return ranges && ranges.length > 0 ? (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">From</TableCell>
            <TableCell align="center">To</TableCell>
            <TableCell align="center">Integral</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ranges.map((range) => (
            <TableRow key={range.from + range.to + range.integral}>
              <TableCell align="center">{range.from.toFixed(3)}</TableCell>
              <TableCell align="center">{range.to.toFixed(3)}</TableCell>
              <TableCell align="center">{range.integral.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  ) : (
    <NoTableData />
  );
};

export default RangesTablePanel;
