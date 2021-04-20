import { useMemo, useCallback, memo, useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ObjectInspector } from 'react-inspector';

import { useDispatch } from '../../context/DispatchContext';
import CheckBox from '../../elements/CheckBox';
import { TableCell, TableRow } from '../../elements/Table';
import { useModal } from '../../elements/popup/Modal';
import {
  ENABLE_FILTER,
  DELETE_FILTER,
  SET_FILTER_SNAPSHOT,
  DELETE_SPECTRA_FILTER,
  SET_LOADING_FLAG,
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
function FiltersTableRow({ filters }) {
  const dispatch = useDispatch();
  const modal = useModal();
  const [selectedFilterID, setSelectedFilter] = useState();

  const handelFilterCheck = useCallback(
    (id, checked) => {
      dispatch({ type: ENABLE_FILTER, id, checked });
    },
    [dispatch],
  );
  const handelDeleteFilter = useCallback(
    ({ id, name }) => {
      modal.showConfirmDialog({
        message: 'Filter/s will be deleted, Are You sure?',
        buttons: [
          {
            text: 'Yes,All spectra',
            handler: () => {
              dispatch({
                type: SET_LOADING_FLAG,
                isLoading: true,
              });
              setTimeout(() => {
                dispatch({
                  type: DELETE_SPECTRA_FILTER,
                  payload: { filterType: name },
                });
              });
            },
          },
          {
            text: 'Yes ',
            handler: () => {
              dispatch({
                type: SET_LOADING_FLAG,
                isLoading: true,
              });
              setTimeout(() => {
                dispatch({ type: DELETE_FILTER, payload: { id } });
              });
            },
          },
          { text: 'No' },
        ],
      });
    },
    [dispatch, modal],
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
                onClick={() => handelDeleteFilter(d)}
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
}

export default memo(FiltersTableRow);
