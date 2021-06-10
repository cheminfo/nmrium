import { useMemo, memo } from 'react';

import {
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
} from '../../elements/Table';
import FiltersWrapper from '../../hoc/FiltersWrapper';
import NoTableData from '../extra/placeholder/NoTableData';

import FiltersTableRow from './FiltersTableRow';

export interface FiltersProps {
  id: number;
  name: string;

  flag: boolean;
  label: string;
  isDeleteAllow: boolean;

  error?: any;
  value: any;
}

interface FilterPanelProps {
  filters: Array<FiltersProps>;
  spectraCounter: number;
}

function FilterPanel({ filters, spectraCounter }: FilterPanelProps) {
  const filtersTable = useMemo(() => {
    return filters ? (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" size={1}>
              Label
            </TableCell>
            <TableCell align="center" size={2}>
              Properties
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <FiltersTableRow filters={filters} spectraCounter={spectraCounter} />
        </TableBody>
      </Table>
    ) : (
      <NoTableData />
    );
  }, [filters, spectraCounter]);

  return filtersTable;
}

export default FiltersWrapper(memo(FilterPanel));
