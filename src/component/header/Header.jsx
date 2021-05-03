/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { SvgLogoNmrium } from 'cheminfo-font';
import { useMemo, useCallback } from 'react';
import {
  FaRegWindowMaximize,
  FaWrench,
  FaQuestionCircle,
} from 'react-icons/fa';

import { useChartData } from '../context/ChartContext';
import Button from '../elements/ButtonToolTip';
import { useAlert } from '../elements/popup/Alert';
import { useHelp } from '../elements/popup/Help';
import { useModal, positions } from '../elements/popup/Modal';
import UserManualModal from '../modal/UserManualModal';
import GeneralSettings from '../modal/setting/GeneralSettings';
import { options } from '../toolbar/ToolTypes';

import AutoPeakPickingOptionPanel from './AutoPeakPickingOptionPanel';
import BaseLineCorrectionPanel from './BaseLineCorrectionPanel';
import ManualPhaseCorrectionPanel from './ManualPhaseCorrectionPanel';
import RangesPickingOptionPanel from './RangesPickingOptionPanel';
import ZeroFillingOptionsPanel from './ZeroFillingOptionsPanel';
import Zones2DOptionPanel from './Zones2DOptionPanel';
import AboutUsModal from '../modal/AboutUsModal';

const headerStyle = css`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  height: 36px;
  min-height: 36px;
  border-width: 1px 1px 0px 1px;
  border-style: solid;
  border-color: rgb(213, 213, 213);
  outline: none;
  transition: background-color 0.2s ease-in 0s;
  box-shadow: rgb(255, 255, 255) 0px 1px 0px 0px inset;
  background: linear-gradient(rgb(255, 255, 255) 5%, rgb(246, 246, 246) 100%)
    rgb(255, 255, 255);
  color: rgb(102, 102, 102);
  font-family: Arial;
  font-weight: bold;
  text-decoration: none;
  text-shadow: rgb(255, 255, 255) 0px 1px 0px;

  .toolOptionsPanel {
    flex: 10;
    padding: 0px;
    margin: 0px;
    height: 100%;
  }

  .windowButtonsContainer {
    flex: 0.5;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
  }

  .windowButton {
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
  }
  button:focus {
    outline: 0;
  }
`;

function Header({ isFullscreen, onMaximize }) {
  const { selectedOptionPanel } = useChartData();
  const modal = useModal();
  const alert = useAlert();
  const help = useHelp();

  const selectedPanel = useMemo(() => {
    switch (selectedOptionPanel) {
      case options.zeroFilling.id:
        return <ZeroFillingOptionsPanel />;
      case options.phaseCorrection.id:
        return <ManualPhaseCorrectionPanel />;
      case options.peakPicking.id:
        return <AutoPeakPickingOptionPanel />;
      case options.rangesPicking.id:
        return <RangesPickingOptionPanel />;
      case options.baseLineCorrection.id:
        return <BaseLineCorrectionPanel />;
      case options.zone2D.id:
        return <Zones2DOptionPanel />;
      default:
        break;
    }
  }, [selectedOptionPanel]);

  const openGeneralSettingsHandler = useCallback(() => {
    modal.show(
      <GeneralSettings
        onSave={() => {
          alert.success('Settings saved successfully');
          modal.close();
        }}
      />,
      {
        position: positions.TOP_CENTER,
        enableResizing: true,
        width: 600,
        height: 400,
      },
    );
  }, [alert, modal]);
  const openUserManual = useCallback(() => {
    modal.show(<UserManualModal />, {
      isBackgroundBlur: false,
      position: positions.TOP_CENTER,
      enableResizing: true,
      width: 800,
      height: 600,
    });
  }, [modal]);

  const openAboutUs = useCallback(() => {
    modal.show(<AboutUsModal />, {
      isBackgroundBlur: false,
      position: positions.TOP_CENTER,
      width: 450,
      height: 500,
    });
  }, [modal]);

  return (
    <div css={headerStyle}>
      <Button
        popupTitle="About Us"
        popupPlacement="right"
        style={{ width: '36px' }}
        onClick={openAboutUs}
        className="windowButton"
      >
        <SvgLogoNmrium />
      </Button>
      <div className="toolOptionsPanel">{selectedPanel}</div>
      <div className="windowButtonsContainer">
        <Button
          popupTitle="User Manual"
          popupPlacement="left"
          onClick={openUserManual}
          className="windowButton"
        >
          <FaQuestionCircle />
        </Button>
        <Button
          popupTitle="General Settings"
          popupPlacement="left"
          onClick={openGeneralSettingsHandler}
          className="windowButton"
        >
          <FaWrench />
        </Button>
        {!isFullscreen ? (
          <Button
            popupTitle="Full Screen"
            popupPlacement="left"
            onClick={onMaximize}
            className="windowButton"
            data-helpid="fullScreen"
            {...help.onHover}
          >
            <FaRegWindowMaximize />
          </Button>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}

Header.defaultProps = {
  onMaximize: function () {
    return null;
  },
};

export default Header;
