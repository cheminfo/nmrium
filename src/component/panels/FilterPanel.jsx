import React, { useMemo, useCallback, memo, useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ObjectInspector } from 'react-inspector';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import CheckBox from '../elements/CheckBox';
import {
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
} from '../elements/Table';
import ConnectToContext from '../hoc/ConnectToContext';
import {
  ENABLE_FILTER,
  DELETE_FILTER,
  SET_FILTER_SNAPSHOT,
} from '../reducer/types/Types';

import NoTableData from './placeholder/NoTableData';

const styles = {
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    height: 25,
    width: 25,
  },
  active: {
    backgroundColor: '#fbfbfb',
    borderTop: '1px solid #817066',
    borderBottom: '1px solid #817066',
  },
};
const FilterPanel = memo(({ data, activeSpectrum }) => {
  // const { data, activeSpectrum } = useChartData();
  const dispatch = useDispatch();
  const [selectedFilterID, setSelectedFilter] = useState();

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
  const filterSnapShotHandler = useCallback(
    (newID) => {
      setSelectedFilter((prevId) => {
        const id = prevId === newID ? null : newID;
        dispatch({ type: SET_FILTER_SNAPSHOT, id });
        return id;
      });
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
        <TableRow
          key={d.id}
          onClick={() => filterSnapShotHandler(d.id)}
          style={d.id === selectedFilterID ? { ...styles.active } : {}}
        >
          <TableCell align="center" size="2">
            {d.label}
          </TableCell>
          <TableCell align="left" size="3">
            <div onClick={(e) => e.stopPropagation()}>
              <ObjectInspector data={d.error ? d.error : d.value} />
            </div>
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
  }, [
    activeSpectrum,
    data,
    filterSnapShotHandler,
    handelDeleteFilter,
    handelFilterCheck,
    selectedFilterID,
  ]);

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
