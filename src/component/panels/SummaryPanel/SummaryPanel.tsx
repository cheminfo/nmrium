/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { getLinkDim, Types } from 'nmr-correlation';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FaFlask, FaSlidersH } from 'react-icons/fa';

import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
import {
  findRange,
  findSignal1D,
  findSignal2D,
  findSpectrum,
  findZone,
} from '../../../data/utilities/FindUtilities';
import { useAssignmentData } from '../../assignment';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Select from '../../elements/Select';
import ToolTip from '../../elements/ToolTip/ToolTip';
import { useModal } from '../../elements/popup/Modal';
import {
  DELETE_1D_SIGNAL,
  DELETE_2D_SIGNAL,
  DELETE_CORRELATION,
  SET_2D_SIGNAL_PATH_LENGTH,
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
import { isInView } from './utilities/Utilities';

const panelStyle = css`
  display: flex;
  flex-direction: column;
  text-align: center;
  height: 100%;
  width: 100%;

  .extra-header-content {
    display: flex;
    width: 100%;

    .overview-container {
      width: 100%;
      display: flex;
      align-items: center;
      margin-left: 10px;
    }

    .table-view-selection {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-right: 2px;

      white-space: nowrap;

      label {
        font-size: 13px;
      }
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
    activeSpectrum,
  } = useChartData();

  const dispatch = useDispatch();
  const modal = useModal();
  const assignmentData = useAssignmentData();

  const [additionalColumnData, setAdditionalColumnData] = useState([]);
  const [
    selectedAdditionalColumnsAtomType,
    setSelectedAdditionalColumnsAtomType,
  ] = useState<string>('H');
  const [showProtonsAsRows, setShowProtonsAsRows] = useState(false);
  const [filterIsActive, setFilterIsActive] = useState(false);

  const filteredCorrelationsData = useMemo(() => {
    if (correlationsData) {
      const _values = filterIsActive
        ? correlationsData.values.filter((correlation) =>
            isInView(
              spectraData,
              activeTab,
              activeSpectrum,
              xDomain,
              yDomain,
              displayerMode,
              correlation,
            ),
          )
        : correlationsData.values;

      return { ...correlationsData, values: _values };
    }
  }, [
    activeSpectrum,
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
    const columnTypes = ['H', 'H-H'].concat(
      correlationsData
        ? correlationsData.values
            .map((correlation) => correlation.atomType)
            .filter(
              (atomType, i, array) =>
                atomType !== 'H' && array.indexOf(atomType) === i,
            )
        : [],
    );

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

  const editNumericValuesSaveHandler = useCallback(
    ({
      correlation,
      values,
      key,
    }: {
      correlation: Types.Correlation;
      values: number[];
      key: 'hybridization' | 'protonsCount';
    }) => {
      dispatch({
        type: SET_CORRELATION,
        payload: {
          id: correlation.id,
          correlation: {
            ...correlation,
            [key]: values,
            edited: { ...correlation.edited, [key]: true },
          },
          options: {
            skipDataUpdate: true,
          },
        },
      });
    },
    [dispatch],
  );

  const setCorrelationsHandler = useCallback(
    (correlations: Types.Values, options?: Types.Options) => {
      dispatch({
        type: SET_CORRELATIONS,
        payload: {
          correlations,
          options,
        },
      });
    },
    [dispatch],
  );

  const deleteCorrelationHandler = useCallback(
    (correlation: Types.Correlation) => {
      dispatch({
        type: DELETE_CORRELATION,
        payload: {
          correlation,
          assignmentData,
        },
      });
    },
    [assignmentData, dispatch],
  );

  const deleteSignalHandler = useCallback(
    (link: Types.Link) => {
      // remove linking signal in spectrum
      const linkDim = getLinkDim(link);
      if (linkDim === 1) {
        const spectrum = findSpectrum(
          spectraData,
          link.experimentID,
          false,
        ) as Datum1D;
        const range = findRange(spectrum, link.signal.id);
        const signal = findSignal1D(spectrum, link.signal.id);

        dispatch({
          type: DELETE_1D_SIGNAL,
          payload: {
            spectrum,
            range,
            signal,
            assignmentData,
          },
        });
      } else if (linkDim === 2) {
        const spectrum = findSpectrum(
          spectraData,
          link.experimentID,
          false,
        ) as Datum2D;
        const zone = findZone(spectrum, link.signal.id);
        const signal = findSignal2D(spectrum, link.signal.id);

        dispatch({
          type: DELETE_2D_SIGNAL,
          payload: {
            spectrum,
            zone,
            signal,
            assignmentData,
          },
        });
      }
    },
    [assignmentData, dispatch, spectraData],
  );

  const changeSignalPathLengthHandler = useCallback(
    (link: Types.Link) => {
      const linkDim = getLinkDim(link);
      if (linkDim === 2) {
        const spectrum = findSpectrum(
          spectraData,
          link.experimentID,
          false,
        ) as Datum2D;
        const zone = findZone(spectrum, link.signal.id);
        const signal = findSignal2D(spectrum, link.signal.id);

        dispatch({
          type: SET_2D_SIGNAL_PATH_LENGTH,
          payload: {
            spectrum,
            zone,
            signal,
            pathLength: link.signal.pathLength,
          },
        });
      }
    },
    [dispatch, spectraData],
  );

  const editCorrelationTableCellHandler = useCallback(
    (
      editedCorrelations: Types.Correlation[],
      action: string,
      link?: Types.Link,
      options?: Types.Options,
    ) => {
      if (
        action === 'add' ||
        action === 'move' ||
        action === 'remove' ||
        action === 'unmove' ||
        action === 'setPathLength'
      ) {
        if (link && link.pseudo === false) {
          if (action === 'remove') {
            deleteSignalHandler(link);
          } else if (action === 'setPathLength') {
            changeSignalPathLengthHandler(link);
          }
        }
        setCorrelationsHandler(editedCorrelations, options);
      } else if (action === 'removeAll') {
        deleteCorrelationHandler(editedCorrelations[0]);
      }
    },
    [
      changeSignalPathLengthHandler,
      deleteCorrelationHandler,
      deleteSignalHandler,
      setCorrelationsHandler,
    ],
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
        <div className="extra-header-content">
          <div className="overview-container">
            <Overview correlationsData={correlationsData} />
          </div>
          <div className="table-view-selection">
            <span>
              <label>View:</label>
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
                  fontSize: '12px',
                  width: '70px',
                  height: '18px',
                  border: '1px solid grey',
                }}
              />
            </span>
          </div>
        </div>
      </DefaultPanelHeader>
      <CorrelationTable
        correlationsData={correlationsData}
        filteredCorrelationsData={filteredCorrelationsData}
        additionalColumnData={additionalColumnData}
        editEquivalencesSaveHandler={editEquivalencesSaveHandler}
        onSaveEditNumericValues={editNumericValuesSaveHandler}
        onEditCorrelationTableCellHandler={editCorrelationTableCellHandler}
        showProtonsAsRows={showProtonsAsRows}
        spectraData={spectraData}
      />
    </div>
  );
}

export default memo(SummaryPanel);
