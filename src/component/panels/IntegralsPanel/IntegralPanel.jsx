/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrSum } from 'cheminfo-font';
import lodash from 'lodash';
import { useCallback, useMemo, useState, useRef, memo, Fragment } from 'react';
import ReactCardFlip from 'react-card-flip';

import { useDispatch } from '../../context/DispatchContext';
import ToolTip from '../../elements/ToolTip/ToolTip';
import { useModal } from '../../elements/popup/Modal';
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
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

function IntegralPanel({ integrals, activeTab, molecules }) {
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

  const changedHandler = useCallback((val) => {
    setIntegralsCounter(val);
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
                className="sum-button"
                type="button"
                onClick={showChangeIntegralSumModal}
              >
                <SvgNmrSum />
              </button>
            </ToolTip>
          </DefaultPanelHeader>
        )}
        {isFlipped && (
          <PreferencesHeader
            onSave={saveSettingHandler}
            onClose={settingsPanelHandler}
          />
        )}
        <div style={{ height: '100%', overflow: 'auto' }}>
          <ReactCardFlip
            isFlipped={isFlipped}
            infinite={true}
            containerStyle={{ overflow: 'hidden' }}
          >
            <div>
              <IntegralTable
                enableFilter={filterIsActive}
                onFilter={changedHandler}
              />
            </div>
            <IntegralsPreferences ref={settingRef} />
          </ReactCardFlip>
        </div>
      </div>
    </Fragment>
  );
}

export default IntegralsWrapper(memo(IntegralPanel));
