/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import lodash from 'lodash';
import { MF } from 'mf-parser';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FaFlask, FaSlidersH } from 'react-icons/fa';

import { SignalKindsToInclude } from '../../../data/constants/SignalsKinds';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useModal } from '../../elements/Modal';
import ToolTip from '../../elements/ToolTip/ToolTip';
import {
  ADD_CORRELATIONS,
  DELETE_CORRELATIONS,
  SET_CORRELATION_MF,
  SET_CORRELATION_STATE,
  SET_CORRELATION_TOLERANCE,
  UNSET_CORRELATION_MF,
} from '../../reducer/types/Types';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import CorrelationTable from './CorrelationTable/CorrelationTable';
import Overview from './Overview';
import SetMolecularFormulaModal from './SetMolecularFormulaModal';
import SetShiftToleranceModal from './SetShiftTolerancesModal';
import {
  addToExperiments,
  buildCorrelationsData,
  buildCorrelationsState,
  checkSignalMatch,
  getAtomType,
} from './Utilities';

const panelStyle = css`
  display: flex;
  flex-direction: column;
  text-align: center;

  button {
    border-radius: 5px;
    margin-top: 3px;
    margin-left: 2px;
    border: none;
    height: 16px;
    width: 18px;
    font-size: 12px;
    padding: 0;
    background-color: transparent;
  }

  .overview-container {
    width: 100%;

    span {
      margin-left: 7px;
    }
  }
`;

const SummaryPanel = memo(() => {
  const { data, molecules, correlations } = useChartData();
  const dispatch = useDispatch();
  const modal = useModal();

  const [mf, setMF] = useState();

  const [tolerance, setTolerance] = useState();

  useEffect(() => {
    if (lodash.get(correlations, 'options.mf', false)) {
      setMF(correlations.options.mf);
    }
  }, [correlations]);

  useEffect(() => {
    if (lodash.get(correlations, 'options.tolerance', false)) {
      setTolerance(correlations.options.tolerance);
    }
  }, [correlations]);

  useEffect(() => {
    if (molecules && molecules.length > 0) {
      dispatch({ type: SET_CORRELATION_MF, mf: molecules[0].mf });
    } else {
      dispatch({ type: UNSET_CORRELATION_MF });
    }
  }, [dispatch, molecules]);

  const showSetMolecularFormulaModal = useCallback(() => {
    modal.show(
      <SetMolecularFormulaModal
        onClose={() => modal.close()}
        onSave={(mf) => dispatch({ type: SET_CORRELATION_MF, mf })}
        molecules={molecules}
        previousMF={mf}
      />,
    );
  }, [dispatch, mf, modal, molecules]);

  const showSetShiftToleranceModal = useCallback(() => {
    modal.show(
      <SetShiftToleranceModal
        onClose={() => modal.close()}
        onSave={(_tolerance) =>
          dispatch({ type: SET_CORRELATION_TOLERANCE, tolerance: _tolerance })
        }
        previousTolerance={tolerance}
      />,
    );
  }, [dispatch, modal, tolerance]);

  const [additionalColumns, setAdditionalColumns] = useState([]);
  const [atoms, setAtoms] = useState({});

  useEffect(() => (mf ? setAtoms(new MF(mf).getInfo().atoms) : setAtoms({})), [
    mf,
  ]);

  // all experiments
  const experiments = useMemo(() => {
    const _experiments = {};
    if (data) {
      data
        .filter((_data) => _data.info.isFid === false)
        .forEach((_data) => {
          if (!lodash.get(_experiments, `${_data.info.dimension}D`, false)) {
            _experiments[`${_data.info.dimension}D`] = {};
          }
          let _experiment = _data.info.experiment;
          if (
            !lodash.get(
              _experiments,
              `${_data.info.dimension}D.${_experiment}`,
              false,
            )
          ) {
            _experiments[`${_data.info.dimension}D`][`${_experiment}`] = [];
          }
          _experiments[`${_data.info.dimension}D`][`${_experiment}`].push(
            _data,
          );
        });
    }
    return _experiments;
  }, [data]);

  useEffect(
    () => setAdditionalColumns(Object.keys(lodash.get(experiments, '2D', []))),
    [experiments],
  );

  // general remark for all experiment types:
  // build an array of experiments, because one could have more than
  // one spectrum in spectra list for one atom type or experiment type

  // "plain" 1D experiments containing ranges, i.e. without DEPT etc.
  const experiments1D = useMemo(() => {
    const _experiments1D = {};
    Object.keys(atoms).forEach((atomType) => {
      addToExperiments(experiments, _experiments1D, '1D.1d', true, atomType);
    });

    return _experiments1D;
  }, [atoms, experiments]);

  // "extra" 1D experiments containing ranges, e.g. DEPT
  const experiments1DExtra = useMemo(() => {
    const _experiments1DExtra = {};
    Object.keys(lodash.get(experiments, `1D`, {}))
      .filter((_experimentType) => _experimentType !== '1d') // don't consider "plain" 1D experiments here
      .forEach((_experimentType) => {
        addToExperiments(
          experiments,
          _experiments1DExtra,
          `1D.${_experimentType}`,
          false,
          _experimentType,
        );
      });

    return _experiments1DExtra;
  }, [experiments]);

  // 2D experiments containing zones
  const experiments2D = useMemo(() => {
    const _experiments2D = {};
    Object.keys(lodash.get(experiments, '2D', {})).forEach(
      (_experimentType) => {
        addToExperiments(
          experiments,
          _experiments2D,
          `2D.${_experimentType}`,
          false,
          _experimentType,
        );
      },
    );

    return _experiments2D;
  }, [experiments]);

  const signals1D = useMemo(() => {
    // store valid signals from 1D experiments
    const _signals1D = {};
    Object.keys(atoms).forEach((atomType) => {
      let _signals = [];
      if (lodash.get(experiments1D, `${atomType}`, []).length > 0) {
        // @TODO for now we will use the first occurring matched spectrum only (index)
        const index = 0;
        const __signals = experiments1D[`${atomType}`][index].ranges.values
          .map((_range) =>
            _range.signal.filter((_signal) =>
              SignalKindsToInclude.includes(_signal.kind),
            ),
          )
          .flat();
        let count = 0;
        __signals.forEach((__signal) => {
          if (
            !_signals.some((_signal) =>
              checkSignalMatch(_signal.signal, __signal, 0.0),
            )
          ) {
            _signals.push({
              experimentType: '1d',
              experimentID: experiments1D[`${atomType}`][index].id,
              atomType: atomType,
              label: { origin: `${atomType}${count + 1}` },
              signal: __signal,
            });
            count++;
          }
        });

        _signals1D[atomType] = _signals;
      }
    });

    return _signals1D;
  }, [atoms, experiments1D]);

  const signals1DExtra = useMemo(() => {
    // store valid signals from 1D extra experiments
    const _signals1DExtra = {};
    // store valid signals from 2D experiments
    Object.keys(experiments1DExtra).forEach((_experimentType) => {
      let _signals = [];
      // @TODO for now we will use the first occurring matched spectrum only (index)
      const index = 0;
      const atomType = getAtomType(
        experiments1DExtra[_experimentType][index].info.nucleus,
      );
      const __signals = experiments1DExtra[_experimentType][index].ranges.values
        .map((_range) =>
          _range.signal.filter((_signal) =>
            SignalKindsToInclude.includes(_signal.kind),
          ),
        )
        .flat();
      let count = 0;
      __signals.forEach((__signal) => {
        if (
          !_signals.some((_signal) =>
            checkSignalMatch(_signal.signal, __signal, 0.0),
          )
        ) {
          _signals.push({
            experimentType: _experimentType,
            experimentID: experiments1DExtra[_experimentType][index].id,
            atomType: atomType,
            label: { origin: `${_experimentType}${count + 1}` },
            signal: __signal,
          });
          count++;
        }
      });

      if (!lodash.get(_signals1DExtra, `${_experimentType}`, false)) {
        _signals1DExtra[_experimentType] = [];
      }
      _signals1DExtra[_experimentType].push({
        signals: _signals,
        experimentType: _experimentType,
        experimentID: experiments1DExtra[_experimentType][index].id,
        atomType: atomType,
      });
    });

    return _signals1DExtra;
  }, [experiments1DExtra]);

  const signals2D = useMemo(() => {
    // store valid signals from 2D experiments
    const _signals2D = {};
    Object.keys(experiments2D).forEach((_experimentType) => {
      let _signals = [];
      // @TODO for now we will use the first occurring matched spectrum only (index)
      const index = 0;
      const atomType = experiments2D[_experimentType][
        index
      ].info.nucleus.map((_nucleus) => getAtomType(_nucleus));
      const __signals = experiments2D[_experimentType][index].zones.values
        .map((_zone) =>
          _zone.signal.filter((_signal) =>
            SignalKindsToInclude.includes(_signal.kind),
          ),
        )
        .flat();
      let count = 0;
      __signals.forEach((__signal) => {
        if (
          !_signals.some(
            (_signal) =>
              checkSignalMatch(_signal.signal.x, __signal.x, 0.0) &&
              checkSignalMatch(_signal.signal.y, __signal.y, 0.0),
          )
        ) {
          _signals.push({
            experimentType: _experimentType,
            experimentID: experiments2D[_experimentType][index].id,
            atomType,
            label: { origin: `${_experimentType}${count + 1}` },
            signal: __signal,
          });
          count++;
        }
      });

      if (!lodash.get(_signals2D, `${_experimentType}`, false)) {
        _signals2D[_experimentType] = [];
      }
      _signals2D[_experimentType].push({
        signals: _signals,
        experimentType: _experimentType,
        experimentID: experiments2D[_experimentType][index].id,
        atomType,
      });
    });

    return _signals2D;
  }, [experiments2D]);

  const atomTypesInSpectra = useMemo(() => {
    const atomTypes1D = Object.keys(signals1D);
    const atomTypes1DExtra = Object.keys(signals1DExtra)
      .map((_experimentType) =>
        signals1DExtra[_experimentType].map(
          (_experiment) => _experiment.atomType,
        ),
      )
      .flat()
      .filter((_atomType, i, a) => a.indexOf(_atomType) === i);
    const atomTypes2D = Object.keys(signals2D)
      .map((_experimentType) =>
        signals2D[_experimentType]
          .map((_experiment) => _experiment.atomType)
          .flat(),
      )
      .flat()
      .filter((_atomType, i, a) => a.indexOf(_atomType) === i);

    return atomTypes1D
      .concat(atomTypes1DExtra)
      .concat(atomTypes2D)
      .filter((_atomType, i, a) => a.indexOf(_atomType) === i);
  }, [signals1D, signals1DExtra, signals2D]);

  useEffect(() => {
    const _correlations = buildCorrelationsData(
      signals1D,
      signals2D,
      tolerance,
    );
    dispatch({ type: DELETE_CORRELATIONS });
    dispatch({ type: ADD_CORRELATIONS, correlations: _correlations });
    dispatch({
      type: SET_CORRELATION_STATE,
      state: buildCorrelationsState(_correlations, atoms, atomTypesInSpectra),
    });
  }, [atomTypesInSpectra, atoms, dispatch, signals1D, signals2D, tolerance]);

  // useEffect(() => {
  //   console.log(correlations);
  // }, [correlations]);

  const editCountSaveHandler = useCallback((correlation, value) => {
    correlation.setCount(value);
  }, []);

  return (
    <div>
      <div css={panelStyle}>
        <DefaultPanelHeader canDelete={false}>
          <ToolTip
            title={`Set molecular formula (${mf})`}
            popupPlacement="right"
          >
            <button type="button" onClick={showSetMolecularFormulaModal}>
              <FaFlask />
            </button>
          </ToolTip>
          <ToolTip title={`Set shift tolerance`} popupPlacement="right">
            <button type="button" onClick={showSetShiftToleranceModal}>
              <FaSlidersH />
            </button>
          </ToolTip>
          <div className="overview-container">
            <Overview correlations={correlations} />
          </div>
        </DefaultPanelHeader>
        <CorrelationTable
          correlations={correlations}
          additionalColumns={additionalColumns}
          editCountSaveHandler={editCountSaveHandler}
        />
      </div>
    </div>
  );
});

export default SummaryPanel;
