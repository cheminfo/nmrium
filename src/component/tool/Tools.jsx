import React, { Fragment } from 'react';

import { options } from '../toolbar/FunctionToolBar';

import CrossLinePointer from './CrossLinePointer';
import PeakNotationTool from './PeakNotationTool';
import IntegralTool from './IntegralTool';
import BrushTool from './BrushTool';

const Tools = ({ mouseCoordinates, selectedTool }) => {
  return (
    <Fragment>
      {selectedTool === options.zoom.id && (
        <Fragment>
          <CrossLinePointer position={mouseCoordinates} />
          <BrushTool isActive={true} />
        </Fragment>
      )}

      {selectedTool === options.integral.id && <IntegralTool isActive={true} />}

      {selectedTool === options.peakPicking.id && (
        <PeakNotationTool
          position={mouseCoordinates}
          showCursorLabel={selectedTool === options.peakPicking.id}
        />
      )}
    </Fragment>
  );
};

export default Tools;
