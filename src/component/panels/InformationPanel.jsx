import React from 'react';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../elements/Table';
import { fromJcamp } from '../../data/data1d/Data1DManager';

const InformationPanel = () => {
  return (
    <div>
      <div>
        <p>Filter function here!!!</p>
      </div>
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">label</TableCell>
              <TableCell align="center">value</TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </div>
    </div>
  );
};

export default InformationPanel;
