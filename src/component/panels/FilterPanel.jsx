import React, { useMemo, useCallback, memo } from 'react';
import { ObjectInspector } from 'react-inspector';
import { FaRegTrashAlt } from 'react-icons/fa';

import {
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
} from '../elements/Table';
import { useChartData } from '../context/ChartContext';
import CheckBox from '../elements/CheckBox';
import { useDispatch } from '../context/DispatchContext';
import { ENABLE_FILTER, DELETE_FILTER } from '../reducer/types/Types';
import ConnectToContext from '../hoc/ConnectToContext';

import NoTableData from './placeholder/NoTableData';

const styles = {
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    height: 25,
    width: 25,
  },
};
const FilterPanel = memo(({ data, activeSpectrum }) => {
  // const { data, activeSpectrum } = useChartData();
  const dispatch = useDispatch();

  const handelFilterCheck = useCallback(
    (id, checked) => {
      dispatch({ type: ENABLE_FILTER, id, checked });
    },
    [dispatch],
  );
  const handelDeleteFilter = useCallback(
    (id) => {
      dispatch({ type: DELETE_FILTER, id });
    },
    [dispatch],
  );
  const filtersTableRow = useMemo(() => {
    const _data =
      data && activeSpectrum && data.find((d) => d.id === activeSpectrum.id);

    return (
      _data &&
      _data.filters &&
      _data.filters.map((d) => (
        <TableRow key={d.id}>
          <TableCell align="center" size="2">
            {d.label}
          </TableCell>
          <TableCell align="left" size="3">
            <ObjectInspector data={d.error ? d.error : d.value} />
          </TableCell>
          <TableCell align="center" vAlign="center" size="1">
            <CheckBox
              checked={d.flag}
              onChange={(checked) => handelFilterCheck(d.id, checked)}
            />
            {d.isDeleteAllow && (
              <button
                style={styles.button}
                type="button"
                onClick={() => handelDeleteFilter(d.id)}
              >
                <FaRegTrashAlt />
              </button>
            )}
          </TableCell>
        </TableRow>
      ))
    );
  }, [activeSpectrum, data, handelDeleteFilter, handelFilterCheck]);

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
    <NoTableData />
  );
});

export default ConnectToContext(FilterPanel, useChartData);
