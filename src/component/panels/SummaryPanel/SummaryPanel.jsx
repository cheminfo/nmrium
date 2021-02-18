/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import lodash from 'lodash';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FaFlask, FaSlidersH } from 'react-icons/fa';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import SelectUncontrolled from '../../elements/SelectUncontrolled';
import ToolTip from '../../elements/ToolTip/ToolTip';
import { useModal } from '../../elements/popup/Modal';
import {
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

const panelStyle = css`
  display: flex;
  flex-direction: column;
  text-align: center;
  height: 100%;

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

  .homoHeteroKinds-container {
    width: 100%;
    span {
      margin-left: 7px;
    }
  }

  .container {
    display: flex;
    flex-direction: column;
    height: calc(100% - 20px);
    overflow: hidden;
    padding: 0;
  }
  .table-container {
    overflow: auto;
  }
`;

function SummaryPanel() {
  const { molecules, correlations: correlationsData } = useChartData();
  const dispatch = useDispatch();
  const modal = useModal();

  const [additionalColumnData, setAdditionalColumnData] = useState([]);
  const [
    selectedAdditionalColumnsAtomType,
    setSelectedAdditionalColumnsAtomType,
  ] = useState('-');
  const [showProtonsAsRows, setShowProtonsAsRows] = useState(false);

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
            .map((correlation) => correlation.getAtomType())
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
    const _selectedAdditionalColumnsAtomType = selectedAdditionalColumnsAtomType.split(
      '-',
    )[0];

    setAdditionalColumnData(
      correlationsData
        ? correlationsData.values
            .filter(
              (correlation) =>
                correlation.atomType === _selectedAdditionalColumnsAtomType,
            )
            .reverse()
        : [],
    );
  }, [correlationsData, selectedAdditionalColumnsAtomType]);

  const editEquivalencesSaveHandler = useCallback(
    (correlation, value) => {
      dispatch({
        type: SET_CORRELATION,
        payload: {
          id: correlation.getID(),
          correlation: {
            ...correlation,
            equivalence: value,
            edited: { ...correlation.getEdited(), equivalence: true },
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
            id: correlation.getID(),
            correlation: {
              ...correlation,
              protonsCount: values,
              edited: { ...correlation.getEdited(), protonsCount: true },
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
          id: correlation.getID(),
          correlation: {
            ...correlation,
            hybridization: value,
            edited: { ...correlation.getEdited(), hybridization: true },
          },
        },
      });
    },
    [dispatch],
  );

  const editAdditionalColumnFieldSaveHandler = useCallback(
    (rowCorrelation, columnCorrelation) => {
      dispatch({
        type: SET_CORRELATIONS,
        payload: {
          ids: [rowCorrelation.getID(), columnCorrelation.getID()],
          correlations: [
            {
              ...rowCorrelation,
              edited: {
                ...rowCorrelation.getEdited(),
                additionalColumnField: true,
              },
            },
            {
              ...columnCorrelation,
              edited: {
                ...columnCorrelation.getEdited(),
                additionalColumnField: true,
              },
            },
          ],
        },
      });
    },
    [dispatch],
  );

  return (
    <div css={panelStyle}>
      <DefaultPanelHeader canDelete={false}>
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
          <SelectUncontrolled
            onChange={(selection) => {
              setSelectedAdditionalColumnsAtomType(selection);
              if (selection === 'H-H') {
                setShowProtonsAsRows(true);
              } else {
                setShowProtonsAsRows(false);
              }
            }}
            data={additionalColumnTypes}
            value={selectedAdditionalColumnsAtomType}
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
        additionalColumnData={additionalColumnData}
        editEquivalencesSaveHandler={editEquivalencesSaveHandler}
        changeHybridizationSaveHandler={changeHybridizationSaveHandler}
        editProtonsCountSaveHandler={editProtonsCountSaveHandler}
        editAdditionalColumnFieldSaveHandler={
          editAdditionalColumnFieldSaveHandler
        }
        showProtonsAsRows={showProtonsAsRows}
      />
    </div>
  );
}

export default memo(SummaryPanel);
