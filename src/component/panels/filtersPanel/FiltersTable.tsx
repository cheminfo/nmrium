import { useMemo, useCallback, memo, useRef } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ObjectInspector } from 'react-inspector';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import CheckBox from '../../elements/CheckBox';
import TableCell from '../../elements/Table/TableCell';
import TableRow from '../../elements/Table/TableRow';
import { useAlert } from '../../elements/popup/Alert';
import { useModal } from '../../elements/popup/Modal';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus';
import useSpectrum from '../../hooks/useSpectrum';
import {
  ENABLE_FILTER,
  DELETE_FILTER,
  SET_FILTER_SNAPSHOT,
  DELETE_SPECTRA_FILTER,
} from '../../reducer/types/Types';

import { FiltersProps } from './FilterPanel';

interface FiltersTableInnerProps {
  filters: Array<FiltersProps>;
  spectraCounter: number;
  selectedTool: string | null;
  activeFilterID: string | null;
}

function FiltersTableInner({
  filters,
  spectraCounter,
  selectedTool,
  activeFilterID,
}: FiltersTableInnerProps) {
  const dispatch = useDispatch();
  const modal = useModal();
  const alert = useAlert();
  const selectedFilterRef = useRef<{ index: string | number | null }>({
    index: null,
  });

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
              'Delete filter process in progress',
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
              'Delete all spectra filter process in progress',
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
    async (newID) => {
      const hideLoading = await alert.showLoading(
        'Filter snapshot process in progress',
      );
      setTimeout(() => {
        dispatch({ type: SET_FILTER_SNAPSHOT, id: newID });
        hideLoading();
      }, 0);
    },
    [alert, dispatch],
  );

  const getStyle = useCallback(
    (filter, index) => {
      const { id, name } = filter;

      if (activeFilterID && activeFilterID === id) {
        selectedFilterRef.current.index = index;
      } else if (!activeFilterID) {
        selectedFilterRef.current.index = null;
      }

      const classes: string[] = ['filter-row'];
      if (activeFilterID === id) {
        classes.push('filter-active');
      } else if (selectedTool === name) {
        classes.push('filter-current');
      } else if (
        selectedFilterRef.current.index != null &&
        index > selectedFilterRef.current.index
      ) {
        classes.push('filter-deactive');
      }

      return classes.join(' ');
    },
    [activeFilterID, selectedTool],
  );

  const filtersTableRow = useMemo(() => {
    return filters?.map((d, index) => {
      return (
        <TableRow key={d.id} className={getStyle(d, index)}>
          <TableCell
            align="center"
            size={2}
            onClick={() => filterSnapShotHandler(d.id)}
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
              onChange={(event) =>
                handelFilterCheck(d.id, event.target.checked)
              }
            />
            {d.isDeleteAllow && (
              <button
                className="btn"
                type="button"
                onClick={() => handelDeleteFilter(d)}
              >
                <FaRegTrashAlt />
              </button>
            )}
          </TableCell>
        </TableRow>
      );
    });
  }, [
    filterSnapShotHandler,
    filters,
    getStyle,
    handelDeleteFilter,
    handelFilterCheck,
  ]);

  return <>{filtersTableRow}</>;
}

const emptyData = { filters: [] };

const MemoizedFiltersTable = memo(FiltersTableInner);

export default function FilterTable() {
  const {
    toolOptions: {
      selectedTool,
      data: { activeFilterID },
    },
  } = useChartData();
  const { filters } = useSpectrum(emptyData);
  const spectraCounter = useSpectraByActiveNucleus().length;

  return (
    <MemoizedFiltersTable
      {...{ selectedTool, filters, spectraCounter, activeFilterID }}
    />
  );
}
