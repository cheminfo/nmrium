import { useMemo, useCallback, memo, useRef } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ObjectInspector } from 'react-inspector';

import { Filter } from '../../../data/FiltersManager';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/Button';
import CheckBox from '../../elements/CheckBox';
import { ColumnWrapper } from '../../elements/ColumnWrapper';
import ReactTable, { Column } from '../../elements/ReactTable/ReactTable';
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

interface FiltersProps extends Filter {
  error?: any;
}

const rowColors = {
  active: {
    base: {
      backgroundColor: '#707070',
      color: 'white',
    },
  },
  deActive: {
    base: {
      opacity: 0.2,
    },
    activated: {
      opacity: 1,
    },
  },
};

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
  const selectedFilterIndex = useRef<number>();

  const handelFilterCheck = useCallback(
    (id, checked) => {
      void (async () => {
        const hideLoading = await alert.showLoading(
          `${checked ? 'Enable' : 'Disable'} filter in progress`,
        );
        setTimeout(() => {
          dispatch({ type: ENABLE_FILTER, id, checked });
          hideLoading();
        }, 0);
      })();
    },
    [alert, dispatch],
  );
  const handelDeleteFilter = useCallback(
    ({ id, name, label }) => {
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
        message: (
          <span>
            You are about to delete this processing step
            <span style={{ color: 'black' }}> {label} </span> , Are you sure?
          </span>
        ),
        buttons,
      });
    },
    [alert, dispatch, modal, spectraCounter],
  );
  const filterSnapShotHandler = useCallback(
    (filter, index) => {
      selectedFilterIndex.current =
        selectedFilterIndex.current && index === selectedFilterIndex.current
          ? null
          : index;
      void (async () => {
        const hideLoading = await alert.showLoading(
          'Filter snapshot process in progress',
        );
        setTimeout(() => {
          dispatch({ type: SET_FILTER_SNAPSHOT, payload: filter });
          hideLoading();
        }, 0);
      })();
    },
    [alert, dispatch],
  );

  const COLUMNS: Column<any>[] = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '25px' },
        accessor: (_, index) => index + 1,
        disableSortBy: true,
      },
      {
        Header: 'Label',
        accessor: 'label',
        disableSortBy: true,
      },

      {
        Header: 'Properties',
        Cell: ({ row }) => {
          const { error, value } = row.original;
          return (
            <ColumnWrapper>
              <ObjectInspector data={error || value} />{' '}
            </ColumnWrapper>
          );
        },
      },
      {
        Header: 'Enable',
        style: { width: '30px' },
        Cell: ({ row }) => {
          const { flag, id } = row.original;

          return (
            <ColumnWrapper>
              <CheckBox
                onChange={(event) =>
                  handelFilterCheck(id, event.target.checked)
                }
                checked={flag}
                style={{ display: 'block', margin: 'auto' }}
              />
            </ColumnWrapper>
          );
        },
      },
      {
        Header: '',
        style: { width: '20px' },
        id: 'delete-button',
        Cell: ({ row }) => {
          const { isDeleteAllow } = row.original;
          return (
            <ColumnWrapper>
              <Button.Danger
                fill="outline"
                onClick={() => handelDeleteFilter(row.original)}
                disabled={!isDeleteAllow}
              >
                <FaRegTrashAlt />
              </Button.Danger>
            </ColumnWrapper>
          );
        },
      },
    ],
    [handelDeleteFilter, handelFilterCheck],
  );

  function handleRowStyle(data) {
    const { original, index } = data;
    const { id, name } = original;
    if (activeFilterID === id || selectedTool === name) {
      return rowColors.active;
    } else if (
      selectedFilterIndex.current &&
      index > selectedFilterIndex.current
    ) {
      return rowColors.deActive;
    }
  }

  return (
    <ReactTable
      rowStyle={handleRowStyle}
      data={filters}
      columns={COLUMNS}
      emptyDataRowText="No Filters"
      onClick={(e, data: any) =>
        filterSnapShotHandler(data.original, data.index)
      }
    />
  );
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
