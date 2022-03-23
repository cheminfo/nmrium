/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrSum } from 'cheminfo-font';
import lodashGet from 'lodash/get';
import { useCallback, useMemo, useState, useRef, memo, Fragment } from 'react';
import { ImLink } from 'react-icons/im';

import { Datum1D, Info1D, Integrals } from '../../../data/types/data1d';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { usePreferences } from '../../context/PreferencesContext';
import ToggleButton from '../../elements/ToggleButton';
import ToolTip from '../../elements/ToolTip/ToolTip';
import { useModal } from '../../elements/popup/Modal';
import useSpectrum from '../../hooks/useSpectrum';
import ChangeSumModal from '../../modal/changeSum/ChangeSumModal';
import {
  DELETE_INTEGRAL,
  CHANGE_INTEGRAL_SUM,
  CHANGE_INTEGRALS_SUM_FLAG,
} from '../../reducer/types/Types';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import IntegralTable from './IntegralTable';
import IntegralsPreferences from './IntegralsPreferences';

const style = css`
  .sum-button {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fix-integral-toggle-btn {
    svg {
      font-size: 12px !important;
    }
  }
`;

export interface IntegralPanelInnerProps {
  integrals: Integrals;
  info: Info1D;
  activeTab: string;
  xDomain: Array<number>;
  preferences: any;
}

function IntegralPanelInner({
  integrals,
  info,
  activeTab,
  xDomain,
  preferences,
}: IntegralPanelInnerProps) {
  const [filterIsActive, setFilterIsActive] = useState(false);

  const dispatch = useDispatch();
  const modal = useModal();
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef<any>();

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
      dispatch({ type: CHANGE_INTEGRAL_SUM, value });
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
        sumOptions={integrals?.options}
      />,
    );
  }, [changeIntegralSumHandler, currentSum, integrals?.options, modal]);

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

  const toggleConstantSumHandler = useCallback(
    (flag) => {
      dispatch({ type: CHANGE_INTEGRALS_SUM_FLAG, payload: flag });
    },
    [dispatch],
  );

  const filteredData = useMemo(() => {
    function isInRange(from, to) {
      const factor = 10000;
      to = to * factor;
      from = from * factor;
      return (
        (to >= xDomain[0] * factor && from <= xDomain[1] * factor) ||
        (from <= xDomain[0] * factor && to >= xDomain[1] * factor)
      );
    }
    if (info.dimension === 1 && integrals?.values) {
      const _integrals = filterIsActive
        ? integrals.values.filter((integral) =>
            isInRange(integral.from, integral.to),
          )
        : integrals.values;

      return _integrals.map((integral) => {
        return {
          ...integral,
          isConstantlyHighlighted: isInRange(integral.from, integral.to),
        };
      });
    }
    return [];
  }, [filterIsActive, info.dimension, integrals, xDomain]);

  return (
    <Fragment>
      <div
        css={[
          tablePanelStyle,
          style,
          isFlipped &&
            css`
              th {
                position: relative;
              }
            `,
        ]}
      >
        {!isFlipped && (
          <DefaultPanelHeader
            counter={integrals?.values?.length}
            onDelete={handleDeleteAll}
            deleteToolTip="Delete All Integrals"
            onFilter={handleOnFilter}
            filterToolTip={
              filterIsActive
                ? 'Show all integrals'
                : 'Hide integrals out of view'
            }
            filterIsActive={filterIsActive}
            counterFiltered={filteredData.length}
            showSettingButton
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
              className="fix-integral-toggle-btn"
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
        <div className="inner-container">
          {!isFlipped ? (
            <IntegralTable
              data={filteredData}
              activeTab={activeTab}
              preferences={preferences}
            />
          ) : (
            <IntegralsPreferences ref={settingRef} />
          )}
        </div>
      </div>
    </Fragment>
  );
}

const MemoizedIntegralPanel = memo(IntegralPanelInner);

const emptyData = { integrals: {}, info: {} };

export default function IntegralPanel() {
  const { xDomain, activeTab } = useChartData();

  const preferences = usePreferences();

  const { integrals, info } = useSpectrum(emptyData) as Datum1D;

  return (
    <MemoizedIntegralPanel
      {...{
        integrals,
        info,
        preferences: preferences.current,
        xDomain,
        activeTab,
      }}
    />
  );
}
