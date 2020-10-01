/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import lodash from 'lodash';
import { useCallback, useMemo, useState, useRef, memo, Fragment } from 'react';
import ReactCardFlip from 'react-card-flip';

import { useDispatch } from '../../context/DispatchContext';
import { useModal } from '../../elements/Modal';
import ToolTip from '../../elements/ToolTip/ToolTip';
import IntegralsWrapper from '../../hoc/IntegralsWrapper';
import ChangeSumModal from '../../modal/changeSum/ChangeSumModal';
import {
  DELETE_INTEGRAL,
  CHANGE_INTEGRAL_SUM,
} from '../../reducer/types/Types';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import IntegralTable from './IntegralTable';
import IntegralsPreferences from './IntegralsPreferences';

const styles = css`
  display: flex;
  flex-direction: column;
  height: 100%;

  .sum-button {
    background-color: transparent;
    border: none;
    width: 22px;
    height: 22px;
    min-height: 22px;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: outline;
    :focus {
      outline: none !important;
    }
  }
`;

const IntegralPanel = memo(({ integrals, activeTab, molecules }) => {
  const [filterIsActive, setFilterIsActive] = useState(false);
  const [integralsCounter, setIntegralsCounter] = useState(0);

  const dispatch = useDispatch();
  const modal = useModal();
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef();

  const yesHandler = useCallback(() => {
    dispatch({ type: DELETE_INTEGRAL, integralID: null });
  }, [dispatch]);

  const handleDeleteAll = useCallback(() => {
    modal.showConfirmDialog('All records will be deleted, Are You sure?', {
      onYes: yesHandler,
    });
  }, [modal, yesHandler]);

  const changeIntegralSumHandler = useCallback(
    (value) => {
      if (value !== undefined) {
        dispatch({ type: CHANGE_INTEGRAL_SUM, value });
      }

      modal.close();
    },
    [dispatch, modal],
  );

  const currentSum = useMemo(() => {
    return lodash.get(integrals, 'options.sum', null);
  }, [integrals]);

  const showChangeIntegralSumModal = useCallback(() => {
    modal.show(
      <ChangeSumModal
        onClose={() => modal.close()}
        onSave={changeIntegralSumHandler}
        header={`Set new Integrals Sum (Current: ${currentSum})`}
        molecules={molecules}
        element={activeTab ? activeTab.replace(/[0-9]/g, '') : null}
      />,
    );
  }, [activeTab, changeIntegralSumHandler, currentSum, modal, molecules]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

  const handleOnFilter = useCallback(() => {
    setFilterIsActive(!filterIsActive);
  }, [filterIsActive]);

  const integralsChangedHandler = useCallback((integrals) => {
    if (integrals) setIntegralsCounter(integrals.length);
  }, []);

  return (
    <Fragment>
      <div css={styles}>
        {!isFlipped && (
          <DefaultPanelHeader
            counter={integralsCounter}
            onDelete={handleDeleteAll}
            deleteToolTip="Delete All Integrals"
            onFilter={handleOnFilter}
            filterToolTip={
              filterIsActive
                ? 'Show all integrals'
                : 'Hide integrals out of view'
            }
            filterIsActive={filterIsActive}
            counterFiltered={integralsCounter}
            showSettingButton="true"
            onSettingClick={settingsPanelHandler}
          >
            <ToolTip
              title={`Change Integrals Sum (${currentSum})`}
              popupPlacement="right"
            >
              <button
                className="ci-icon-nmr-sum sum-button"
                type="button"
                onClick={showChangeIntegralSumModal}
              />
            </ToolTip>
          </DefaultPanelHeader>
        )}
        {isFlipped && (
          <PreferencesHeader
            onSave={saveSettingHandler}
            onClose={settingsPanelHandler}
          />
        )}

        <ReactCardFlip
          isFlipped={isFlipped}
          infinite={true}
          containerStyle={{ height: '100%' }}
        >
          <div>
            <IntegralTable
              enableFilter={filterIsActive}
              onIntegralsChange={integralsChangedHandler}
            />
          </div>
          <IntegralsPreferences ref={settingRef} />
        </ReactCardFlip>
      </div>
    </Fragment>
  );
});

export default IntegralsWrapper(IntegralPanel);
