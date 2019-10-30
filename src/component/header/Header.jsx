import React, { useMemo } from 'react';
import { FaRegWindowMaximize } from 'react-icons/fa';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useChartData } from '../context/ChartContext';
import { Filters } from '../../data/data1d/filter1d/Filters';

import ZeroFillingOptionsPanel from './ZeroFillingOptionsPanel';
import ManualPhaseCorrectionPanel from './ManualPhaseCorrectionPanel';

const headerStyle = css`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  height: 36px;
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
    align-items: flex-end;
    justify-content: flex-end;
  }

  .windowButton {
    width: 40px !important;
    min-width: 40px !important;
    background-color: transparent;
    border: none;
  }
`;

const Header = ({ isFullscreen, onMaximize }) => {
  const { selectedFilter } = useChartData();

  const selectedPanel = useMemo(() => {
    if (selectedFilter === Filters.zeroFilling.name) {
      return <ZeroFillingOptionsPanel />;
    } else if (selectedFilter === Filters.phaseCorrection.name) {
      return <ManualPhaseCorrectionPanel />;
    }
  }, [selectedFilter]);

  return (
    <div css={headerStyle}>
      <div className="toolOptionsPanel">{selectedPanel}</div>
      <div className="windowButtonsContainer">
        {!isFullscreen ? (
          <button type="button" onClick={onMaximize} className="windowButton">
            <FaRegWindowMaximize />
          </button>
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

Header.defaultProps = {
  onMaximize: function() {
    return null;
  },
};

export default Header;
