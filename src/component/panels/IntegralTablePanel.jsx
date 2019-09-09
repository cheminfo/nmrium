import React, { useEffect, useState, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { ChartContext } from '../context/ChartContext';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(0),
    overflowY: 'auto',
    padding: '5px',
  },
  table: {
    // minWidth: 650,
  },
  cell: {
    padding: '0px',
  },
}));

const IntegralTablePanel = () => {
  const classes = useStyles();
  const [integrals, setIntegrals] = useState([]);
  const { activeSpectrum, data } = useContext(ChartContext);

  useEffect(() => {
    const spectrum = activeSpectrum
      ? data.find((d) => d.id === activeSpectrum.id)
      : [];
    const hasData = spectrum && spectrum.integrals;
    setIntegrals(hasData ? spectrum.integrals : []);
  }, [activeSpectrum, data]);

  return activeSpectrum && data && integrals.length > 0 ? (
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.cell} align="center">
              From
            </TableCell>
            <TableCell className={classes.cell} align="center">
              To
            </TableCell>
            <TableCell className={classes.cell} align="center">
              Value
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {integrals.map((row) => (
            <TableRow key={row.to + row.from + row.value}>
              <TableCell
                className={classes.cell}
                align="center"
                component="th"
                scope="row"
              >
                {row.from.toFixed(2)}
              </TableCell>
              <TableCell className={classes.cell} align="center">
                {row.to.toFixed(2)}
              </TableCell>
              <TableCell className={classes.cell} align="center">
                {row.value.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
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

export default IntegralTablePanel;
