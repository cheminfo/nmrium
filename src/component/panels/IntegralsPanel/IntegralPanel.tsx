/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrIntegrate } from 'cheminfo-font';
import lodashGet from 'lodash/get';
import { Spectrum1D } from 'nmr-load-save';
import { Info1D, Integrals } from 'nmr-processing';
import { useCallback, useMemo, useState, useRef, memo } from 'react';
import { ImLink } from 'react-icons/im';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useModal } from '../../elements/popup/Modal';
import { useActiveSpectrumIntegralsViewState } from '../../hooks/useActiveSpectrumIntegralsViewState';
import useSpectrum from '../../hooks/useSpectrum';
import ChangeSumModal from '../../modal/changeSum/ChangeSumModal';
import { toString } from '../../utility/toString';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import IntegralTable from './IntegralTable';
import IntegralsPreferences from './IntegralsPreferences';

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

  const total = integrals?.values?.length || 0;

  return (
    <div
      css={[
        tablePanelStyle,
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
          total={total}
          counter={filteredData?.length}
          onDelete={handleDeleteAll}
          deleteToolTip="Delete All Integrals"
          onFilter={handleOnFilter}
          filterToolTip={
            filterIsActive ? 'Show all integrals' : 'Hide integrals out of view'
          }
          onSettingClick={settingsPanelHandler}
          leftButtons={[
            {
              component: (
                <ChangeSumModal
                  onSave={changeIntegralSumHandler}
                  sumType="integration"
                  currentSum={currentSum}
                  sumOptions={integrals?.options}
                />
              ),
            },
            {
              icon: <ImLink />,
              title: 'Fixed integration values',
              onClick: toggleConstantSumHandler,
              active: integrals?.options?.isSumConstant || false,
            },
            {
              icon: <SvgNmrIntegrate />,
              title: `${toString(!showIntegralsValues)} integrals values`,
              onClick: handleShowIntegralsValues,
              active: showIntegralsValues,
            },
          ]}
        />
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
