/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrIntegrate, SvgNmrSum } from 'cheminfo-font';
import lodashGet from 'lodash/get';
import { Spectrum1D } from 'nmr-load-save';
import { Info1D, Integrals } from 'nmr-processing';
import { useCallback, useMemo, useState, useRef, memo } from 'react';
import { ImLink } from 'react-icons/im';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import ActiveButton from '../../elements/ActiveButton';
import ToolTip from '../../elements/ToolTip/ToolTip';
import { useModal } from '../../elements/popup/Modal';
import useSpectrum from '../../hooks/useSpectrum';
import ChangeSumModal from '../../modal/changeSum/ChangeSumModal';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader, {
  createFilterLabel,
} from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import IntegralTable from './IntegralTable';
import IntegralsPreferences from './IntegralsPreferences';
import { useActiveSpectrumIntegralsViewState } from '../../hooks/useActiveSpectrumIntegralsViewState';

const style = css`
  .sum-button {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  button {
    margin-right: 2px;
  }
`;

export interface IntegralPanelInnerProps {
  integrals: Integrals;
  info: Info1D;
  activeTab: string;
  xDomain: number[];
}

function IntegralPanelInner({
  integrals,
  info,
  activeTab,
  xDomain,
}: IntegralPanelInnerProps) {
  const [filterIsActive, setFilterIsActive] = useState(false);

  const dispatch = useDispatch();
  const { showIntegralsValues } = useActiveSpectrumIntegralsViewState();

  const modal = useModal();
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef<any>();

  function handleShowIntegralsValues() {
    dispatch({
      type: 'TOGGLE_INTEGRALS_VIEW_PROPERTY',
      payload: { key: 'showIntegralsValues' },
    });
  }

  const yesHandler = useCallback(() => {
    dispatch({ type: 'DELETE_INTEGRAL', payload: {} });
  }, [dispatch]);

  const handleDeleteAll = useCallback(() => {
    modal.showConfirmDialog({
      message: 'All records will be deleted, Are You sure?',
      buttons: [{ text: 'Yes', handler: yesHandler }, { text: 'No' }],
    });
  }, [modal, yesHandler]);

  const changeIntegralSumHandler = useCallback(
    (options) => {
      dispatch({ type: 'CHANGE_INTEGRAL_SUM', payload: { options } });
    },
    [dispatch],
  );

  const currentSum = useMemo(() => {
    return lodashGet(integrals, 'options.sum', null);
  }, [integrals]);

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

  const toggleConstantSumHandler = useCallback(() => {
    dispatch({ type: 'CHANGE_INTEGRALS_SUM_FLAG' });
  }, [dispatch]);

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

  const counter = integrals?.values?.length || 0;

  return (
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
          counter={counter}
          counterLabel={createFilterLabel(
            counter,
            filterIsActive && filteredData?.length,
          )}
          onDelete={handleDeleteAll}
          deleteToolTip="Delete All Integrals"
          onFilter={handleOnFilter}
          filterToolTip={
            filterIsActive ? 'Show all integrals' : 'Hide integrals out of view'
          }
          showSettingButton
          onSettingClick={settingsPanelHandler}
        >
          <ToolTip
            title={
              currentSum
                ? `Change integration sum (${currentSum.toFixed(2)})`
                : 'Change integration sum'
            }
            popupPlacement="right"
          >
            <ChangeSumModal
              onSave={changeIntegralSumHandler}
              sumType="integrals"
              currentSum={currentSum}
              sumOptions={integrals?.options}
              renderButton={(onClick) => (
                <button className="sum-button" type="button" onClick={onClick}>
                  <SvgNmrSum />
                </button>
              )}
            />
          </ToolTip>

          <ActiveButton
            className="icon"
            popupTitle="Fixed integration values"
            popupPlacement="right"
            onClick={toggleConstantSumHandler}
            value={integrals?.options?.isSumConstant || false}
          >
            <ImLink />
          </ActiveButton>
          <ActiveButton
            popupTitle={
              showIntegralsValues
                ? 'Hide integrals values'
                : 'Show integrals values'
            }
            popupPlacement="right"
            onClick={handleShowIntegralsValues}
            value={showIntegralsValues}
          >
            <SvgNmrIntegrate
              style={{ pointerEvents: 'none', fontSize: '12px' }}
            />
          </ActiveButton>
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
            info={info}
            activeTab={activeTab}
          />
        ) : (
          <IntegralsPreferences ref={settingRef} />
        )}
      </div>
    </div>
  );
}

const MemoizedIntegralPanel = memo(IntegralPanelInner);

const emptyData = { integrals: {}, info: {} };

export default function IntegralPanel() {
  const {
    xDomain,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();

  const { integrals, info } = useSpectrum(emptyData) as Spectrum1D;

  return (
    <MemoizedIntegralPanel
      {...{
        integrals,
        info,
        xDomain,
        activeTab,
      }}
    />
  );
}
