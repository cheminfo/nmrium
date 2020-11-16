/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { memo, useCallback, useEffect, useState } from 'react';
import { FaFlask, FaSlidersH } from 'react-icons/fa';

import { useChartData } from '../../context/ChartContext';
import { useModal } from '../../elements/Modal';
import ToolTip from '../../elements/ToolTip/ToolTip';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import CorrelationTable from './CorrelationTable/CorrelationTable';
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

const SummaryPanel = memo(() => {
  const { data, molecules } = useChartData();
  const modal = useModal();
  const [mf, setMF] = useState();

  const defaultToleranceHeavyAtom = 0.25;
  const defaultToleranceProton = 0.02;
  const [tolerance, setTolerance] = useState({
    C: defaultToleranceHeavyAtom,
    H: defaultToleranceProton,
    N: defaultToleranceHeavyAtom,
    F: defaultToleranceHeavyAtom,
    Si: defaultToleranceHeavyAtom,
    P: defaultToleranceHeavyAtom,
  });

  useEffect(() => {
    if (molecules && molecules.length > 0) {
      setMF(molecules[0].mf);
    } else {
      setMF(undefined);
    }
  }, [molecules]);

  const showSetMolecularFormulaModal = useCallback(() => {
    modal.show(
      <SetMolecularFormulaModal
        onClose={() => modal.close()}
        onSave={(mf) => setMF(mf)}
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
      </DefaultPanelHeader>
      <CorrelationTable data={data} mf={mf} tolerance={tolerance} />
    </div>
  );
});

export default SummaryPanel;
