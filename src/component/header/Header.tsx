import { Header, Toolbar } from 'analysis-ui-components';
import { SvgLogoNmrium } from 'cheminfo-font';
import { useMemo, useCallback, memo } from 'react';
import {
  FaRegWindowMaximize,
  FaWrench,
  FaQuestionCircle,
} from 'react-icons/fa';

import { docsBaseUrl } from '../../constants';
import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { useModal, positions } from '../elements/popup/Modal';
import AboutUsModal from '../modal/AboutUsModal';
import GeneralSettings from '../modal/setting/GeneralSettings';
import { options } from '../toolbar/ToolTypes';

import AutoPeakPickingOptionPanel from './AutoPeakPickingOptionPanel';
import BaseLineCorrectionPanel from './BaseLineCorrectionPanel';
import ManualPhaseCorrectionPanel from './ManualPhaseCorrectionPanel';
import RangesPickingOptionPanel from './RangesPickingOptionPanel';
import ZeroFillingOptionsPanel from './ZeroFillingOptionsPanel';
import Zones2DOptionPanel from './Zones2DOptionPanel';

interface HeaderInnerProps {
  onMaximize?: () => void;
  isFullscreen: boolean;
  selectedOptionPanel: string | null;
  hideGeneralSettings: boolean;
}

function HeaderInner(props: HeaderInnerProps) {
  const {
    isFullscreen,
    onMaximize = () => null,
    selectedOptionPanel,
    hideGeneralSettings,
  } = props;

  const modal = useModal();

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
    modal.show(<GeneralSettings />, {
      position: positions.TOP_CENTER,
      enableResizing: true,
      width: 600,
      height: 400,
    });
  }, [modal]);

  const openAboutUs = useCallback(() => {
    modal.show(<AboutUsModal />, {
      isBackgroundBlur: false,
      position: positions.MIDDLE,
      width: 500,
      height: 480,
    });
  }, [modal]);

  return (
    <Header>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <div>
          <Toolbar orientation="horizontal">
            <Toolbar.Item
              onClick={openAboutUs}
              titleOrientation="horizontal"
              id="logo"
              title="About NMRium"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SvgLogoNmrium />
              </div>
            </Toolbar.Item>
          </Toolbar>
        </div>
        <div className="toolOptionsPanel">{selectedPanel}</div>
      </div>

      <Toolbar orientation="horizontal">
        <Toolbar.Item
          id="user-manual"
          title="User manual"
          onClick={() => window.open(docsBaseUrl, '_blank')}
        >
          <FaQuestionCircle />
        </Toolbar.Item>
        {!hideGeneralSettings && (
          <Toolbar.Item
            id="general-settings"
            onClick={openGeneralSettingsHandler}
            title="General settings"
          >
            <FaWrench />
          </Toolbar.Item>
        )}

        {!isFullscreen && (
          <Toolbar.Item
            id="full-screen"
            onClick={onMaximize}
            title="Full Screen"
            className="windowButton"
          >
            <FaRegWindowMaximize />
          </Toolbar.Item>
        )}
      </Toolbar>
    </Header>
  );
}

const MemoizedHeader = memo(HeaderInner);

export default function HeaderWrapper({ isFullscreen, onMaximize }) {
  const {
    toolOptions: { selectedOptionPanel },
  } = useChartData();
  const {
    current: {
      display: { general },
    },
  } = usePreferences();

  return (
    <MemoizedHeader
      {...{
        selectedOptionPanel,
        isFullscreen,
        onMaximize,
        hideGeneralSettings: general?.hideGeneralSettings || false,
      }}
    />
  );
}
