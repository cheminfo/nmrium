import { useMemo, useCallback, memo, useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ObjectInspector } from 'react-inspector';

import { useDispatch } from '../../context/DispatchContext';
import CheckBox from '../../elements/CheckBox';
import { TableCell, TableRow } from '../../elements/Table';
import { useAlert } from '../../elements/popup/Alert';
import { useModal } from '../../elements/popup/Modal';
import {
  ENABLE_FILTER,
  DELETE_FILTER,
  SET_FILTER_SNAPSHOT,
  DELETE_SPECTRA_FILTER,
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
  const alert = useAlert();
  const [selectedFilterID, setSelectedFilter] = useState();

  const handelFilterCheck = useCallback(
    async (id, checked) => {
      const hideLoading = await alert.showLoading(
        `${checked ? 'Enable' : 'Disable'} filter in progress`,
      );
      setTimeout(() => {
        dispatch({ type: ENABLE_FILTER, id, checked });
        hideLoading();
      }, 0);
    },
    [alert, dispatch],
  );
  const handelDeleteFilter = useCallback(
    ({ id, name }) => {
      modal.showConfirmDialog({
        message: 'Are you sure you want to delete the spectrum?',
        buttons: [
          {
            text: 'Yes, for all spectra',
            handler: async () => {
              const hideLoading = await alert.showLoading(
                'Delete all spectra filter processs in progress',
              );
              dispatch({
                type: DELETE_SPECTRA_FILTER,
                payload: { filterType: name },
              });
              hideLoading();
            },
          },
          {
            text: 'Yes',
            handler: async () => {
              const hideLoading = await alert.showLoading(
                'Delete filter processs in progress',
              );
              dispatch({ type: DELETE_FILTER, payload: { id } });
              hideLoading();
            },
          },
          { text: 'No' },
        ],
      });
    },
    [alert, dispatch, modal],
  );
  const filterSnapShotHandler = useCallback(
    async (newID) => {
      const hideLoading = await alert.showLoading(
        'Filter snapshot processs in progress',
      );
      setTimeout(() => {
        setSelectedFilter((prevId) => {
          const id = prevId === newID ? null : newID;
          dispatch({ type: SET_FILTER_SNAPSHOT, id });
          return id;
        });
        hideLoading();
      }, 0);
    },
    [alert, dispatch],
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
