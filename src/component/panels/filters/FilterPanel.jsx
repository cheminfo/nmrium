import React, { useMemo, memo } from 'react';

import { useChartData } from '../../context/ChartContext';
import {
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
} from '../../elements/Table';
import NoTableData from '../extra/placeholder/NoTableData';

import FiltersTableRow from './FiltersTableRow';

const FilterPanel = memo(() => {
  const { data, activeSpectrum } = useChartData();

  const spectrumData =
    data &&
    activeSpectrum &&
    activeSpectrum.id &&
    data.find((d) => d.id === activeSpectrum.id);
  const filters = spectrumData && spectrumData.filters;

  const filtersTable = useMemo(() => {
    return filters ? (
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
        <TableBody>
          <FiltersTableRow filters={filters} />
        </TableBody>
      </Table>
    ) : (
      <NoTableData />
    );
  }, [filters]);

  return filtersTable;
});

export default FilterPanel;
