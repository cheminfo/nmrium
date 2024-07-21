/** @jsxImportSource @emotion/react */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { css } from '@emotion/react';
import { ConfirmDialog, useOnOff } from 'react-science/ui';

import { useDispatch } from '../../context/DispatchContext';
import { useToaster } from '../../context/ToasterContext';
import useSpectrum from '../../hooks/useSpectrum';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import FiltersTable from './FiltersTable';

export default function FiltersPanel() {
  const dispatch = useDispatch();
  const [confirmDialogIsOpen, openConfirmDialog, closeConfirmDialog] =
    useOnOff();
  const toaster = useToaster();
  const data = useSpectrum();

  return (
    <div css={tablePanelStyle}>
      <ConfirmDialog
        saveText="Yes"
        cancelText="No"
        headerColor="red"
        isOpen={confirmDialogIsOpen}
        onClose={closeConfirmDialog}
        onConfirm={() => {
          const hideLoading = toaster.showLoading({
            message: 'Delete filters process in progress',
          });
          dispatch({ type: 'DELETE_FILTER', payload: {} });
          hideLoading();
          closeConfirmDialog();
        }}
      >
        You are about to delete all processing steps, Are you sure?
      </ConfirmDialog>
      <DefaultPanelHeader
        deleteToolTip="Delete all filters"
        onDelete={openConfirmDialog}
        total={data?.filters.length}
      />
      <div className="inner-container">
        <FiltersTable />
      </div>
    </div>
  );
}
