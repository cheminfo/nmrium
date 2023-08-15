/** @jsxImportSource @emotion/react */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { css } from '@emotion/react';
import { useCallback } from 'react';
import { useOnOff, ConfirmModal } from 'react-science/ui';

import { useDispatch } from '../../context/DispatchContext';
import { useAlert } from '../../elements/popup/Alert/Context';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import FiltersTable from './FiltersTable';

export default function FiltersPanel() {
  const [isOpen, open, close] = useOnOff();
  const dispatch = useDispatch();
  const alert = useAlert();

  function handelDeleteFilter() {
    open();
  }
  const confirmHandler = useCallback(async () => {
    const hideLoading = await alert.showLoading(
      'Delete filters process in progress',
    );
    dispatch({ type: 'DELETE_FILTER', payload: {} });
    hideLoading();
    close();
  }, [alert, close, dispatch]);

  return (
    <div css={tablePanelStyle}>
      <DefaultPanelHeader
        showSettingButton={false}
        deleteToolTip="Delete all filters"
        onDelete={handelDeleteFilter}
      />
      <div className="inner-container">
        <FiltersTable />
      </div>
      <ConfirmModal
        headerColor="red"
        onConfirm={confirmHandler}
        onCancel={() => {
          close();
        }}
        isOpen={isOpen}
        onRequestClose={() => {
          close();
        }}
        saveText="Yes"
        cancelText="No"
      >
        <div
          style={{
            display: 'flex',
            flex: '1 1 0%',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            margin: 25,
            fontSize: 14,
            color: 'rgb(175, 0, 0)',
          }}
        >
          <span>
            You are about to delete all processing steps, Are you sure?
          </span>
        </div>
      </ConfirmModal>
    </div>
  );
}
