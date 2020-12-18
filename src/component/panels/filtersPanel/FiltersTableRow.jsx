import { useMemo, useCallback, memo, useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ObjectInspector } from 'react-inspector';

import { useDispatch } from '../../context/DispatchContext';
import CheckBox from '../../elements/CheckBox';
import { TableCell, TableRow } from '../../elements/Table';
import {
  ENABLE_FILTER,
  DELETE_FILTER,
  SET_FILTER_SNAPSHOT,
} from '../../reducer/types/Types';

const styles = {
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    height: 25,
    width: 25,
    padding: '5px',
  },
  active: {
    backgroundColor: '#fbfbfb',
    borderTop: '1px solid #817066',
    borderBottom: '1px solid #817066',
  },
};
const FiltersTableRow = memo(({ filters }) => {
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
    return (
      filters &&
      filters.map((d) => (
        <TableRow
          key={d.id}
          style={d.id === selectedFilterID ? { ...styles.active } : {}}
        >
          <TableCell
            align="center"
            size="2"
            onClick={() => filterSnapShotHandler(d.id)}
          >
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
              onChange={(event) =>
                handelFilterCheck(d.id, event.target.checked)
              }
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
    filterSnapShotHandler,
    filters,
    handelDeleteFilter,
    handelFilterCheck,
    selectedFilterID,
  ]);
  return filtersTableRow;
});

export default FiltersTableRow;
