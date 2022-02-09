/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrAddFilter, SvgNmrExportAsMatrix } from 'cheminfo-font';
import { useCallback } from 'react';

import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/ButtonToolTip';
import { positions } from '../../elements/popup/Modal';
import { useModal } from '../../elements/popup/Modal';
import ExportAsMatrixModal from '../../modal/ExportAsMatrixModal';
import MultipleSpectraFiltersModal from '../../modal/MultipleSpectraFiltersModal';
import { RESET_SELECTED_TOOL } from '../../reducer/types/Types';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

function MatrixGenerationPanel() {
  const modal = useModal();
  const dispatch = useDispatch();

  const openFiltersModal = useCallback(() => {
    dispatch({ type: RESET_SELECTED_TOOL });
    modal.show(<MultipleSpectraFiltersModal />, {
      isBackgroundBlur: false,
      position: positions.TOP_CENTER,
      width: 550,
      height: 250,
    });
  }, [modal, dispatch]);

  const openExportAsMatrixModal = useCallback(() => {
    dispatch({ type: RESET_SELECTED_TOOL });
    modal.show(<ExportAsMatrixModal />, {
      isBackgroundBlur: false,
      position: positions.TOP_CENTER,
      width: 500,
    });
  }, [modal, dispatch]);

  return (
    <div css={tablePanelStyle}>
      {
        <DefaultPanelHeader
          deleteToolTip="Delete All Peaks"
          showSettingButton
          canDelete={false}
        >
          <Button popupTitle="Add Filter" onClick={openFiltersModal}>
            <SvgNmrAddFilter style={{ fontSize: '18px' }} />
          </Button>
          <Button
            popupTitle="Export spectra as a Matrix"
            onClick={openExportAsMatrixModal}
          >
            <SvgNmrExportAsMatrix />
          </Button>
        </DefaultPanelHeader>
      }

      <div className="inner-container"></div>
    </div>
  );
}

export default MatrixGenerationPanel;
