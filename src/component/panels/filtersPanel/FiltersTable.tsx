/** @jsxImportSource @emotion/react */
import { Checkbox, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { Filter } from 'nmr-processing';
import { useMemo, useCallback, memo, useRef, useState, ReactNode } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ObjectInspector } from 'react-inspector';
import { Button, useOnOff } from 'react-science/ui';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useToaster } from '../../context/ToasterContext';
import { ColumnWrapper } from '../../elements/ColumnWrapper';
import ReactTable, { Column } from '../../elements/ReactTable/ReactTable';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus';
import useSpectrum from '../../hooks/useSpectrum';

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
  filters: FiltersProps[];
  spectraCounter: number;
  activeFilterID: string | null;
}

function FiltersTableInner({
  filters,
  spectraCounter,
  activeFilterID,
}: FiltersTableInnerProps) {
  const dispatch = useDispatch();
  const toaster = useToaster();
  const selectedFilterIndex = useRef<number>();
  const [confirmDialogIsOpen, openConfirmDialog, closeConfirmDialog] =
    useOnOff();
  const [confirmDialogContent, setConfirmDialogContent] = useState<{
    message: ReactNode;
    buttons: Array<{
      text: string;
      handler?: () => void;
    }>;
  }>({ message: '', buttons: [] });

  const handelFilterCheck = useCallback(
    (id, event) => {
      const { checked: enabled } = event.target;
      const hideLoading = toaster.showLoading({
        message: `${enabled ? 'Enable' : 'Disable'} filter in progress`,
      });
      setTimeout(() => {
        dispatch({ type: 'ENABLE_FILTER', payload: { id, enabled } });
        hideLoading();
      }, 0);
    },
    [dispatch, toaster],
  );
  const handelDeleteFilter = useCallback(
    ({ id, name, label }) => {
      const buttons = [
        { text: 'No' },
        {
          text: 'Yes',
          handler: () => {
            const hideLoading = toaster.showLoading({
              message: 'Delete filter process in progress',
            });
            dispatch({ type: 'DELETE_FILTER', payload: { id } });
            hideLoading();
            closeConfirmDialog();
          },
        },
      ];

      if (spectraCounter > 1) {
        buttons.push({
          text: 'Yes, for all spectra',
          handler: () => {
            const hideLoading = toaster.showLoading({
              message: 'Delete all spectra filter process in progress',
            });
            dispatch({
              type: 'DELETE_SPECTRA_FILTER',
              payload: { filterName: name },
            });
            hideLoading();
            closeConfirmDialog();
          },
        });
      }

      setConfirmDialogContent({
        message: (
          <span>
            You are about to delete this processing step
            <span style={{ color: 'black' }}> {label} </span> , Are you sure?
          </span>
        ),
        buttons,
      });
      openConfirmDialog();
    },
    [dispatch, spectraCounter, toaster, closeConfirmDialog, openConfirmDialog],
  );
  const filterSnapShotHandler = useCallback(
    (filter, index) => {
      selectedFilterIndex.current =
        selectedFilterIndex.current && index === selectedFilterIndex.current
          ? null
          : index;
      const hideLoading = toaster.showLoading({
        message: 'Filter snapshot process in progress',
      });
      setTimeout(() => {
        dispatch({ type: 'SET_FILTER_SNAPSHOT', payload: filter });
        hideLoading();
      }, 0);
    },
    [dispatch, toaster],
  );

  const COLUMNS: Array<Column<any>> = useMemo(
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
              <Checkbox
                onChange={(event) => handelFilterCheck(id, event)}
                checked={flag}
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
              <Button
                intent="danger"
                minimal
                onClick={() => handelDeleteFilter(row.original)}
                disabled={!isDeleteAllow}
              >
                <FaRegTrashAlt />
              </Button>
            </ColumnWrapper>
          );
        },
      },
    ],
    [handelDeleteFilter, handelFilterCheck],
  );

  function handleRowStyle(data) {
    const { original, index } = data;
    const { id } = original;
    if (activeFilterID) {
      if (activeFilterID === id) {
        return rowColors.active;
      } else if (
        selectedFilterIndex.current &&
        index > selectedFilterIndex.current
      ) {
        return rowColors.deActive;
      }
    }
  }

  return (
    <>
      <Dialog
        isOpen={confirmDialogIsOpen}
        onClose={closeConfirmDialog}
        title=" "
        isCloseButtonShown={false}
        css={css`
          .bp5-dialog-header {
            background-color: red;
            min-height: 0px;
          }
        `}
      >
        <DialogBody>{confirmDialogContent.message}</DialogBody>
        <DialogFooter
          minimal
          actions={confirmDialogContent.buttons.map((option, i) => (
            <Button
              key={option.text}
              intent={i === 0 ? 'danger' : 'primary'}
              text={option.text}
              onClick={() => {
                option.handler?.();
                closeConfirmDialog();
              }}
            />
          ))}
        />
      </Dialog>
      <ReactTable
        rowStyle={handleRowStyle}
        data={filters}
        columns={COLUMNS}
        emptyDataRowText="No Filters"
        onClick={(e, data: any) =>
          filterSnapShotHandler(data.original, data.index)
        }
      />
    </>
  );
}

const emptyData = { filters: [] };

const MemoizedFiltersTable = memo(FiltersTableInner);

export default function FilterTable() {
  const {
    toolOptions: {
      data: { activeFilterID },
    },
  } = useChartData();
  const { filters } = useSpectrum(emptyData);
  const spectraCounter = useSpectraByActiveNucleus().length;

  return (
    <MemoizedFiltersTable {...{ filters, spectraCounter, activeFilterID }} />
  );
}
