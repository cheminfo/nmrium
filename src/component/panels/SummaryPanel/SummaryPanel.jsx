/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import lodash from 'lodash';
import { Correlation } from 'nmr-correlation';
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
  UPDATE_CORRELATIONS,
} from '../../reducer/types/Types';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import { DefaultTolerance } from './CorrelationTable/Constants';
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
  const { data, molecules, correlations: correlationsData } = useChartData();
  const dispatch = useDispatch();
  const modal = useModal();

  const [mf, setMF] = useState();
  const [tolerance, setTolerance] = useState(DefaultTolerance);
  const [additionalColumnData, setAdditionalColumnData] = useState([]);
  const [
    selectedAdditionalColumnsAtomType,
    setSelectedAdditionalColumnsAtomType,
  ] = useState('-');
  const [showProtonsAsRows, setShowProtonsAsRows] = useState(false);

  useEffect(() => {
    if (lodash.get(correlationsData, 'options.mf', false)) {
      setMF(correlationsData.options.mf);
    }
  }, [correlationsData]);

  useEffect(() => {
    if (lodash.get(correlationsData, 'options.tolerance', false)) {
      setTolerance(correlationsData.options.tolerance);
    }
  }, [correlationsData]);

  const showSetMolecularFormulaModal = useCallback(() => {
    modal.show(
      <SetMolecularFormulaModal
        onClose={() => modal.close()}
        onSave={(_mf) => setMF(_mf)}
        molecules={molecules}
        previousMF={mf}
      />,
    );
  }, [mf, modal, molecules]);

  const showSetShiftToleranceModal = useCallback(() => {
    modal.show(
      <SetShiftToleranceModal
        onClose={() => modal.close()}
        onSave={(_tolerance) => setTolerance(_tolerance)}
        previousTolerance={tolerance}
      />,
    );
  }, [modal, tolerance]);

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

  useEffect(() => {
    if (data && mf && tolerance) {
      dispatch({
        type: UPDATE_CORRELATIONS,
        spectra: data,
        mf,
        tolerance,
        correlationsData,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, dispatch, mf, tolerance]);

  const editEquivalencesSaveHandler = useCallback(
    (correlation, value) => {
      dispatch({
        type: SET_CORRELATION,
        correlationsData: lodash.cloneDeep(correlationsData),
        id: correlation.getID(),
        correlation: new Correlation({
          ...correlation,
          equivalence: value,
          edited: { ...correlation.getEdited(), equivalence: true },
        }),
      });
    },
    [correlationsData, dispatch],
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
          correlationsData: lodash.cloneDeep(correlationsData),
          id: correlation.getID(),
          correlation: new Correlation({
            ...correlation,
            protonsCount: values,
            edited: { ...correlation.getEdited(), protonsCount: true },
          }),
        });
      }
    },
    [correlationsData, dispatch],
  );

  const changeHybridizationSaveHandler = useCallback(
    (correlation, value) => {
      dispatch({
        type: SET_CORRELATION,
        correlationsData: lodash.cloneDeep(correlationsData),
        id: correlation.getID(),
        correlation: new Correlation({
          ...correlation,
          hybridization: value,
          edited: { ...correlation.getEdited(), hybridization: true },
        }),
      });
    },
    [correlationsData, dispatch],
  );

  const editAdditionalColumnFieldSaveHandler = useCallback(
    (rowCorrelation, columnCorrelation) => {
      dispatch({
        type: SET_CORRELATIONS,
        correlationsData: lodash.cloneDeep(correlationsData),
        ids: [rowCorrelation.getID(), columnCorrelation.getID()],
        correlations: [
          new Correlation({
            ...rowCorrelation,
            edited: {
              ...rowCorrelation.getEdited(),
              additionalColumnField: true,
            },
          }),
          new Correlation({
            ...columnCorrelation,
            edited: {
              ...columnCorrelation.getEdited(),
              additionalColumnField: true,
            },
          }),
        ],
      });
    },
    [correlationsData, dispatch],
  );

  return (
    <div css={panelStyle}>
      <DefaultPanelHeader canDelete={false}>
        <ToolTip title={`Set molecular formula (${mf})`} popupPlacement="right">
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
