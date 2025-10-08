import type { Info1D, Integrals } from '@zakodium/nmr-types';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import { SvgNmrIntegrate } from 'cheminfo-font';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { ImLink } from 'react-icons/im';

import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useAlert } from '../../elements/Alert.js';
import { useActiveSpectrumIntegralsViewState } from '../../hooks/useActiveSpectrumIntegralsViewState.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import ChangeSumModal from '../../modal/changeSum/ChangeSumModal.js';
import { booleanToString } from '../../utility/booleanToString.js';
import { TablePanel } from '../extra/BasicPanelStyle.js';
import type { SettingsRef } from '../extra/utilities/settingImperativeHandle.js';
import DefaultPanelHeader from '../header/DefaultPanelHeader.js';
import PreferencesHeader from '../header/PreferencesHeader.js';

import IntegralTable from './IntegralTable.js';
import IntegralsPreferences from './IntegralsPreferences.js';

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

  const alert = useAlert();
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef<SettingsRef | null>(null);

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
    alert.showAlert({
      message: 'All records will be deleted, Are You sure?',
      buttons: [
        { text: 'Yes', onClick: yesHandler, intent: 'danger' },
        { text: 'No' },
      ],
    });
  }, [alert, yesHandler]);

  const changeIntegralSumHandler = useCallback(
    (options: any) => {
      dispatch({ type: 'CHANGE_INTEGRAL_SUM', payload: { options } });
    },
    [dispatch],
  );

  // TODO: make sure currentSum is not a lie and remove the optional chaining.
  const currentSum = integrals?.options?.sum ?? null;

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(async () => {
    const isSettingValid = await settingRef.current?.saveSetting();
    if (isSettingValid) {
      setFlipStatus(false);
    }
  }, []);

  const handleOnFilter = useCallback(() => {
    setFilterIsActive(!filterIsActive);
  }, [filterIsActive]);

  const toggleConstantSumHandler = useCallback(() => {
    dispatch({ type: 'CHANGE_INTEGRALS_SUM_FLAG' });
  }, [dispatch]);

  const filteredData = useMemo(() => {
    function isInRange(from: any, to: any) {
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
    <TablePanel isFlipped={isFlipped}>
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
              tooltip: 'Fixed integration values',
              onClick: toggleConstantSumHandler,
              active: integrals?.options?.isSumConstant || false,
            },
            {
              icon: <SvgNmrIntegrate />,
              tooltip: `${booleanToString(!showIntegralsValues)} integrals values`,
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
    </TablePanel>
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
