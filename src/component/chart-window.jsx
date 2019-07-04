import React, { useState } from 'react';
import { Window, TitleBar } from 'react-desktop/windows';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import './css/chart-window.css';

const ChartWindow = ({width, height,title,children}) => {
  const [_width, setWidth] = useState(width);
  const [_height, setHeight] = useState(height);
  const [_isMaximized, setIsMaximized] = useState(false);
  const [_windowPosition, setWindowPosition] = useState(null);

  const toggleMaximize = () => {
    setIsMaximized(!_isMaximized);
    if (_isMaximized) {
      setWindowPosition(null);

      setWidth(width);
      setHeight(height);
    } else {
      setWindowPosition({ x: 0, y: 0 });
      setWidth(window.innerWidth - 5);
      setHeight(window.innerHeight - 82);
    }
  };

  return (
      <Draggable
        // axis="x"
        handle=".handle"
        defaultPosition={{ x: 0, y: 0 }}
        position={_windowPosition}
        grid={[25, 25]}
        scale={1}
      >
        <Window
          color="white"
          theme="dark"
          chrome
          height={_height + 80}
          width={_width}
          // padding="12px"
          background="white"
        >
          <TitleBar
            className="handle"
            title={title}
            isMaximized={_isMaximized}
            theme="black"
            color="red"
            controls={true}
            onMaximizeClick={toggleMaximize}
            onRestoreDownClick={toggleMaximize}
          />
          {React.cloneElement(children, { width: _width,height:_height })}

        </Window>
      </Draggable>
  );
};

ChartWindow.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.array.isRequired,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  title:PropTypes.string
};

ChartWindow.defaultProps = {
  width: 800,
  height: 800,
  data: [],
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  title:''
};

export default ChartWindow;
