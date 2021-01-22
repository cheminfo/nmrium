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

function FilterPanel({ filters }) {
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
}

export default FiltersWrapper(memo(FilterPanel));
