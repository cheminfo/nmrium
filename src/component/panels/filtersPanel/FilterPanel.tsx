/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
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

import FiltersTable from './FiltersTable';

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
  selectedTool: string | number;
  activeFilterID: string | number;
}

const styles = css`
  .btn {
    background-color: transparent;
    border: none;
    height: 25;
    width: 25;
    padding: 5px;
  }
  .filter-row {
    padding: 5px !important;
  }
  .filter-active {
    background-color: #f7f7f7;
    div,
    span,
    .btn {
      color: black !important;
    }

    li {
      background-color: transparent !important;
    }
  }
  .filter-current {
    background-color: #707070;
    div,
    span,
    .btn {
      color: white !important;
    }

    li {
      background-color: transparent !important;
    }
  }

  .filter-deactive {
    opacity: 0.3;
  }
`;

function FilterPanel({ filters }: FilterPanelProps) {
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
        <TableBody css={styles}>
          <FiltersTable />
        </TableBody>
      </Table>
    ) : (
      <NoTableData />
    );
  }, [filters]);

  return filtersTable;
}

export default FiltersWrapper(memo(FilterPanel));
