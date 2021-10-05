/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import lodashCloneDeep from 'lodash/cloneDeep';
import {
  addLink,
  buildLink,
  getCorrelationIndex,
  getLinkDelta,
  getLinkDim,
  removeLink,
  Types,
} from 'nmr-correlation';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FaFlask, FaSlidersH } from 'react-icons/fa';

import { Datum2D } from '../../../data/data2d/Spectrum2D';
import {
  findSignal2D,
  findSpectrum,
  findZone,
} from '../../../data/utilities/FindUtilities';
import generateID from '../../../data/utilities/generateID';
import { useAssignmentData } from '../../assignment';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Select from '../../elements/Select';
import ToolTip from '../../elements/ToolTip/ToolTip';
import { useModal } from '../../elements/popup/Modal';
import { DISPLAYER_MODE } from '../../reducer/core/Constants';
import {
  DELETE_2D_SIGNAL,
  SET_CORRELATION,
  SET_CORRELATIONS,
  SET_CORRELATIONS_MF,
  SET_CORRELATIONS_TOLERANCE,
} from '../../reducer/types/Types';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import CorrelationTable from './CorrelationTable/CorrelationTable';
import Overview from './Overview';
import SetMolecularFormulaModal from './SetMolecularFormulaModal';
import SetShiftToleranceModal from './SetShiftTolerancesModal';
import { findSignalMatch1D, findSignalMatch2D, getAtomType } from './Utilities';

const panelStyle = css`
  display: flex;
  flex-direction: column;
  text-align: center;
  height: 100%;
  width: 100%;
  justify-content: center,
  align-items: 'center',

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
    margin-left: 15px;
    white-space: nowrap;
    span {
      margin-left: 8px;
    }
  }

  .homoHeteroKinds-container {
    width: 100%;
    margin-left: 15px;
    span {
      margin-left: 7px;
    }
  }


`;

function SummaryPanel() {
  const {
    molecules,
    correlations: correlationsData,
    data: spectraData,
    xDomain,
    yDomain,
    displayerMode,
    activeTab,
  } = useChartData();

  const dispatch = useDispatch();
  const modal = useModal();
  const assignmentData = useAssignmentData();

  const [additionalColumnData, setAdditionalColumnData] = useState([]);
  const [
    selectedAdditionalColumnsAtomType,
    setSelectedAdditionalColumnsAtomType,
  ] = useState<string>('-');
  const [showProtonsAsRows, setShowProtonsAsRows] = useState(false);
  const [filterIsActive, setFilterIsActive] = useState(false);

  const filteredCorrelationsData = useMemo(() => {
    const isInView = (correlation: Types.Correlation) => {
      if (correlation.pseudo === true) {
        return false;
      }
      const atomTypesInView = activeTab
        .split(',')
        .map((tab) => getAtomType(tab));

      const factor = 10000;
      const xDomain0 = xDomain[0] * factor;
      const xDomain1 = xDomain[1] * factor;
      const yDomain0 = yDomain[0] * factor;
      const yDomain1 = yDomain[1] * factor;

      if (displayerMode === DISPLAYER_MODE.DM_1D) {
        const firstLink1D = correlation.link.find(
          (link) => getLinkDim(link) === 1,
        );
        if (!firstLink1D) {
          return false;
        }
        const delta = getLinkDelta(firstLink1D) * factor;
        const spectrum = findSpectrum(
          spectraData,
          firstLink1D.experimentID,
          true,
        );
        if (
          spectrum &&
          atomTypesInView[0] === correlation.atomType &&
          delta >= xDomain0 &&
          delta <= xDomain1
        ) {
          return true;
        }
        // try to find a link which contains the belonging 2D signal in the spectra in view
        if (
          correlation.link.some((link) => {
            const spectrum = findSpectrum(
              spectraData,
              link.experimentID,
              true,
            ) as Datum2D;
            return findSignalMatch1D(
              spectrum,
              link,
              factor,
              xDomain0,
              xDomain1,
            );
          })
        ) {
          return true;
        }
      } else if (displayerMode === DISPLAYER_MODE.DM_2D) {
        if (!atomTypesInView.includes(correlation.atomType)) {
          return false;
        }
        const firstLink2D = correlation.link.find(
          (link) => getLinkDim(link) === 2,
        );
        if (!firstLink2D) {
          return false;
        }
        const spectrum = findSpectrum(
          spectraData,
          firstLink2D.experimentID,
          true,
        ) as Datum2D;
        // correlation is represented by a 2D signal
        if (
          findSignalMatch2D(
            spectrum,
            firstLink2D,
            factor,
            xDomain0,
            xDomain1,
            yDomain0,
            yDomain1,
          )
        ) {
          return true;
        } else {
          // try to find a link which contains the belonging 2D signal in the spectra in view
          if (
            correlation.link.some((link) => {
              const spectrum = findSpectrum(
                spectraData,
                link.experimentID,
                true,
              ) as Datum2D;
              return findSignalMatch2D(
                spectrum,
                link,
                factor,
                xDomain0,
                xDomain1,
                yDomain0,
                yDomain1,
              );
            })
          ) {
            return true;
          }
        }
      }
      // do not show correlation
      return false;
    };

    if (correlationsData) {
      const _values = filterIsActive
        ? correlationsData.values.filter((correlation) => isInView(correlation))
        : correlationsData.values;

      return { ...correlationsData, values: _values };
    }
  }, [
    activeTab,
    correlationsData,
    displayerMode,
    filterIsActive,
    spectraData,
    xDomain,
    yDomain,
  ]);

  const handleOnSetMolecularFormula = useCallback(
    (mf) => {
      dispatch({
        type: SET_CORRELATIONS_MF,
        payload: {
          mf,
        },
      });
    },
    [dispatch],
  );

  const handleOnSetShiftTolerance = useCallback(
    (tolerance) => {
      dispatch({
        type: SET_CORRELATIONS_TOLERANCE,
        payload: {
          tolerance,
        },
      });
    },
    [dispatch],
  );

  const showSetMolecularFormulaModal = useCallback(() => {
    modal.show(
      <SetMolecularFormulaModal
        onClose={() => modal.close()}
        onSave={handleOnSetMolecularFormula}
        molecules={molecules}
        previousMF={correlationsData.options.mf}
      />,
    );
  }, [correlationsData, handleOnSetMolecularFormula, modal, molecules]);

  const showSetShiftToleranceModal = useCallback(() => {
    modal.show(
      <SetShiftToleranceModal
        onClose={() => modal.close()}
        onSave={handleOnSetShiftTolerance}
        previousTolerance={correlationsData.options.tolerance}
      />,
    );
  }, [correlationsData, handleOnSetShiftTolerance, modal]);

  const additionalColumnTypes = useMemo(() => {
    const columnTypes = ['-'].concat(
      correlationsData
        ? correlationsData.values
            .map((correlation) => correlation.atomType)
            .filter((atomType, i, array) => array.indexOf(atomType) === i)
        : [],
    );

    if (columnTypes.includes('H')) {
      columnTypes.push('H-H');
    }

    if (columnTypes.includes('H')) {
      setSelectedAdditionalColumnsAtomType('H');
    } else {
      setSelectedAdditionalColumnsAtomType('-');
    }

    return columnTypes.map((columnType) => {
      return {
        key: columnType,
        label: columnType,
        value: columnType,
      };
    });
  }, [correlationsData]);

  useEffect(() => {
    const _selectedAdditionalColumnsAtomType =
      selectedAdditionalColumnsAtomType.split('-')[0];

    setAdditionalColumnData(
      filteredCorrelationsData
        ? filteredCorrelationsData.values
            .filter(
              (correlation) =>
                correlation.atomType === _selectedAdditionalColumnsAtomType,
            )
            .reverse()
        : [],
    );
  }, [filteredCorrelationsData, selectedAdditionalColumnsAtomType]);

  const editEquivalencesSaveHandler = useCallback(
    (correlation, value) => {
      dispatch({
        type: SET_CORRELATION,
        payload: {
          id: correlation.id,
          correlation: {
            ...correlation,
            equivalence: value,
            edited: { ...correlation.edited, equivalence: true },
          },
        },
      });
    },
    [dispatch],
  );

  const editProtonsCountSaveHandler = useCallback(
    (correlation, valuesString) => {
      let values;
      // eslint-disable-next-line prefer-named-capture-group
      if (valuesString.match(/^([0-9],{0,1})+$/g)) {
        // allow digits followed by optional comma only
        values = valuesString
          .split(',')
          .filter((char) => char.length > 0)
          .map((char) => Number(char));
      } else if (valuesString.trim().length === 0) {
        // set values to default
        values = [];
      }

      if (values) {
        // ignore not supported text input
        dispatch({
          type: SET_CORRELATION,
          payload: {
            id: correlation.id,
            correlation: {
              ...correlation,
              protonsCount: values,
              edited: { ...correlation.edited, protonsCount: true },
            },
          },
        });
      }
    },
    [dispatch],
  );

  const changeHybridizationSaveHandler = useCallback(
    (correlation, value) => {
      dispatch({
        type: SET_CORRELATION,
        payload: {
          id: correlation.id,
          correlation: {
            ...correlation,
            hybridization: value,
            edited: { ...correlation.edited, hybridization: true },
          },
        },
      });
    },
    [dispatch],
  );

  const setCorrelationsHandler = useCallback(
    (correlations: Types.Values) => {
      const ids = correlations.map((correlation) => correlation.id);

      dispatch({
        type: SET_CORRELATIONS,
        payload: {
          ids: ids,
          correlations: correlations.map((correlation) => {
            return {
              ...correlation,
              edited: {
                ...correlation.edited,
                additionalColumnField: true,
              },
            };
          }),
        },
      });
    },
    [dispatch],
  );

  const deleteSignal2DHandler = useCallback(
    (commonLink: Types.Link) => {
      // remove linking signal in spectrum
      const spectrum = findSpectrum(
        spectraData,
        commonLink.experimentID,
        false,
      ) as Datum2D;
      const zone = findZone(spectrum, commonLink.signal.id);
      const signal = findSignal2D(spectrum, commonLink.signal.id);

      dispatch({
        type: DELETE_2D_SIGNAL,
        payload: {
          spectrum,
          zone,
          signal,
          assignmentData,
        },
      });
    },
    [assignmentData, dispatch, spectraData],
  );

  const editAdditionalColumnFieldHandler = useCallback(
    (
      columnCorrelation: Types.Correlation,
      rowCorrelation: Types.Correlation,
      experimentType: string,
      action: string,
      commonLink?: Types.Link,
      newColumnCorrelation?: Types.Correlation,
      newRowCorrelation?: Types.Correlation,
    ) => {
      if (action === 'add') {
        const _rowCorrelation = lodashCloneDeep(rowCorrelation);
        const _columnCorrelation = lodashCloneDeep(columnCorrelation);
        // only pseudo links can be added manually
        const pseudoLinkCountHSQC = _rowCorrelation.link.filter(
          (link) =>
            link.experimentType === 'hsqc' || link.experimentType === 'hmqc',
        ).length;
        const pseudoLinkID = generateID();
        const pseudoExperimentID = generateID();
        const commonPseudoLink = buildLink({
          experimentType,
          experimentID: pseudoExperimentID,
          atomType: [_columnCorrelation.atomType, _rowCorrelation.atomType],
          id: pseudoLinkID,
          pseudo: true,
          signal: { id: generateID(), sign: 0 }, // pseudo signal
        });

        addLink(
          _columnCorrelation,
          buildLink({
            ...commonPseudoLink,
            axis: 'x',
            match: [
              getCorrelationIndex(correlationsData.values, _rowCorrelation),
            ],
          }),
        );
        addLink(
          _rowCorrelation,
          buildLink({
            ...commonPseudoLink,
            axis: 'y',
            match: [
              getCorrelationIndex(correlationsData.values, _columnCorrelation),
            ],
          }),
        );
        if (!_rowCorrelation.edited.protonsCount) {
          _rowCorrelation.protonsCount = [pseudoLinkCountHSQC + 1];
        }
        setCorrelationsHandler([_rowCorrelation, _columnCorrelation]);
      } else if (action === 'remove') {
        if (commonLink.pseudo === false) {
          deleteSignal2DHandler(commonLink);
        } else {
          const _rowCorrelation = lodashCloneDeep(rowCorrelation);
          const _columnCorrelation = lodashCloneDeep(columnCorrelation);
          const pseudoLinkCountHSQC = _rowCorrelation.link.filter(
            (link) =>
              link.experimentType === 'hsqc' || link.experimentType === 'hmqc',
          ).length;
          // remove pseudo link
          removeLink(_rowCorrelation, commonLink.id);
          removeLink(_columnCorrelation, commonLink.id);
          if (!_rowCorrelation.edited.protonsCount) {
            _rowCorrelation.protonsCount =
              pseudoLinkCountHSQC - 1 > 0 ? [pseudoLinkCountHSQC - 1] : [];
          }
          setCorrelationsHandler([_rowCorrelation, _columnCorrelation]);
        }
      } else if (action === 'move') {
        if (newColumnCorrelation && newRowCorrelation) {
          setCorrelationsHandler([
            rowCorrelation,
            columnCorrelation,
            newColumnCorrelation,
            newRowCorrelation,
          ]);
        }
      }
    },
    [correlationsData.values, deleteSignal2DHandler, setCorrelationsHandler],
  );

  const handleOnFilter = useCallback(() => {
    setFilterIsActive(!filterIsActive);
  }, [filterIsActive]);

  return (
    <div css={panelStyle}>
      <DefaultPanelHeader
        canDelete={false}
        counter={correlationsData ? correlationsData.values.length : 0}
        onFilter={handleOnFilter}
        filterToolTip={
          filterIsActive
            ? 'Show all correlations'
            : 'Hide correlations out of view'
        }
        filterIsActive={filterIsActive}
        counterFiltered={filteredCorrelationsData?.values.length}
      >
        <ToolTip
          title={`Set molecular formula (${correlationsData.options.mf})`}
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
          <Overview correlationsData={correlationsData} />
        </div>
        <div className="homoHeteroKinds-container">
          <Select
            onChange={(selection) => {
              setSelectedAdditionalColumnsAtomType(selection);
              if (selection === 'H-H') {
                setShowProtonsAsRows(true);
              } else {
                setShowProtonsAsRows(false);
              }
            }}
            data={additionalColumnTypes}
            defaultValue={selectedAdditionalColumnsAtomType}
            style={{
              width: '65px',
              height: '20px',
              border: '1px solid grey',
            }}
          />
        </div>
      </DefaultPanelHeader>
      <CorrelationTable
        correlationsData={correlationsData}
        filteredCorrelationsData={filteredCorrelationsData}
        additionalColumnData={additionalColumnData}
        editEquivalencesSaveHandler={editEquivalencesSaveHandler}
        changeHybridizationSaveHandler={changeHybridizationSaveHandler}
        editProtonsCountSaveHandler={editProtonsCountSaveHandler}
        editAdditionalColumnFieldHandler={editAdditionalColumnFieldHandler}
        showProtonsAsRows={showProtonsAsRows}
        spectraData={spectraData}
      />
    </div>
  );
}

export default memo(SummaryPanel);
