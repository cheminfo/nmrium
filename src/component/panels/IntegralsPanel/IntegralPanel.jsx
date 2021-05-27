/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrSum } from 'cheminfo-font';
import lodashGet from 'lodash/get';
import { useCallback, useMemo, useState, useRef, memo, Fragment } from 'react';
import ReactCardFlip from 'react-card-flip';
import { ImLink } from 'react-icons/im';

import { useDispatch } from '../../context/DispatchContext';
import ToggleButton from '../../elements/ToggleButton';
import ToolTip from '../../elements/ToolTip/ToolTip';
import { useModal } from '../../elements/popup/Modal';
import IntegralsWrapper from '../../hoc/IntegralsWrapper';
import ChangeSumModal from '../../modal/changeSum/ChangeSumModal';
import {
  DELETE_INTEGRAL,
  CHANGE_INTEGRAL_SUM,
  CHANGE_INTEGRALS_SUM_FLAG,
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

  .constant-sum-button {
    svg {
      font-size: 10px !important;
    }
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
    modal.showConfirmDialog({
      message: 'All records will be deleted, Are You sure?',
      buttons: [{ text: 'Yes', handler: yesHandler }, { text: 'No' }],
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
    return lodashGet(integrals, 'options.sum', null);
  }, [integrals]);

  const showChangeIntegralSumModal = useCallback(() => {
    modal.show(
      <ChangeSumModal
        onClose={() => modal.close()}
        onSave={changeIntegralSumHandler}
        header={
          currentSum
            ? `Set new Integrals Sum (Current: ${Number(currentSum).toFixed(
                2,
              )})`
            : 'Set new Integrals Sum'
        }
        molecules={molecules}
        element={activeTab ? activeTab.replace(/[0-9]/g, '') : null}
      />,
    );
  }, [activeTab, changeIntegralSumHandler, currentSum, modal, molecules]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
    if (!isFlipped) {
      settingRef.current.cancelSetting();
    }
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

  const toggleConstantSumHandler = useCallback(
    (flag) => {
      dispatch({ type: CHANGE_INTEGRALS_SUM_FLAG, payload: flag });
    },
    [dispatch],
  );

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
              title={
                currentSum
                  ? `Change Integrals Sum (${Number(currentSum).toFixed(2)})`
                  : 'Change Integrals Sum'
              }
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
            <ToggleButton
              popupTitle="fix integral values"
              popupPlacement="right"
              onClick={toggleConstantSumHandler}
            >
              <ImLink />
            </ToggleButton>
          </DefaultPanelHeader>
        )}
        {isFlipped && (
          <PreferencesHeader
            onSave={saveSettingHandler}
            onClose={settingsPanelHandler}
          />
        )}
        <div style={{ height: '100%', overflow: 'hidden' }}>
          <ReactCardFlip
            isFlipped={isFlipped}
            infinite
            containerStyle={{ overflow: 'hidden', height: '100%' }}
          >
            <div style={{ overflow: 'auto', height: '100%', display: 'block' }}>
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
