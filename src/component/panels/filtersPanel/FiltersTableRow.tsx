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

import { FiltersProps } from './FilterPanel';

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

interface FiltersTableRowProps {
  filters: Array<FiltersProps>;
  spectraCounter: number;
}

function FiltersTableRow({ filters, spectraCounter }: FiltersTableRowProps) {
  const dispatch = useDispatch();
  const modal = useModal();
  const alert = useAlert();
  const [selectedFilterIndex, setSelectedFilter] = useState<number>(0);

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
      const buttons = [
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
      ];

      if (spectraCounter > 1) {
        buttons.unshift({
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
        });
      }

      modal.showConfirmDialog({
        message: 'Are you sure you want to delete the spectrum?',
        buttons,
      });
    },
    [alert, dispatch, modal, spectraCounter],
  );
  const filterSnapShotHandler = useCallback(
    async (newID, index) => {
      const hideLoading = await alert.showLoading(
        'Filter snapshot processs in progress',
      );
      setTimeout(() => {
        setSelectedFilter((prevIndex) => {
          const id = prevIndex === index ? null : newID;
          dispatch({ type: SET_FILTER_SNAPSHOT, id });
          return id ? index : null;
        });
        hideLoading();
      }, 0);
    },
    [alert, dispatch],
  );
  const filtersTableRow = useMemo(() => {
    return filters?.map((d, index) => (
      <TableRow
        key={d.id}
        style={{
          ...(index === selectedFilterIndex && styles.active),
          ...(selectedFilterIndex != null && index > selectedFilterIndex
            ? { opacity: 0.3 }
            : {}),
        }}
      >
        <TableCell
          align="center"
          size={2}
          onClick={() => filterSnapShotHandler(d.id, index)}
        >
          {d.label}
        </TableCell>
        <TableCell align="left" size={3}>
          <div onClick={(e) => e.stopPropagation()}>
            <ObjectInspector data={d.error ? d.error : d.value} />
          </div>
        </TableCell>
        <TableCell align="center" vAlign="center" size={1}>
          <CheckBox
            checked={d.flag}
            onChange={(event) => handelFilterCheck(d.id, event.target.checked)}
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
    ));
  }, [
    filterSnapShotHandler,
    filters,
    handelDeleteFilter,
    handelFilterCheck,
    selectedFilterIndex,
  ]);

  return <>{filtersTableRow}</>;
}

export default memo(FiltersTableRow);
