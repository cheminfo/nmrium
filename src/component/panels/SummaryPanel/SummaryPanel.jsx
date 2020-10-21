/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useCallback, useEffect, useState } from 'react';
import { FaFlask } from 'react-icons/fa';

import { useChartData } from '../../context/ChartContext';
import { useModal } from '../../elements/Modal';
import ToolTip from '../../elements/ToolTip/ToolTip';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import CorrelationTable from './CorrelationTable';
import SetMolecularFormulaModal from './SetMolecularFormulaModal';

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
`;

const SummaryPanel = () => {
  const { molecules } = useChartData();
  const modal = useModal();
  const [mf, setMF] = useState();

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

  return (
    <div>
      <div css={panelStyle}>
        <DefaultPanelHeader showDeleteButton={false} showCounterLabel={false}>
          <ToolTip title={`Set a Molecular Formula`} popupPlacement="right">
            <button type="button" onClick={showSetMolecularFormulaModal}>
              <FaFlask />
            </button>
          </ToolTip>
        </DefaultPanelHeader>
        <CorrelationTable mf={mf} />
      </div>
    </div>
  );
};

export default SummaryPanel;
