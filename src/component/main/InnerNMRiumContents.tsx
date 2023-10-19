/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { MouseEvent, RefObject, useCallback } from 'react';

import checkModifierKeyActivated from '../../data/utilities/checkModifierKeyActivated';
import Viewer1D from '../1d/Viewer1D';
import FloatMoleculeStructures from '../1d-2d/components/FloatMoleculeStructures';
import Viewer2D from '../2d/Viewer2D';
import KeysListenerTracker from '../EventsTrackers/KeysListenerTracker';
import { useChartData } from '../context/ChartContext';
import Header from '../header/Header';
import DropZone from '../loader/DropZone';
import Panels from '../panels/Panels';
import ToolBar from '../toolbar/ToolBar';

import { SplitPaneWrapper } from './SplitPaneWrapper';
import { StateError } from './StateError';

import { NMRiumProps } from '.';

const viewerContainerStyle = css`
  border: 0.55px #e6e6e6 solid;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  margin-left: -1px;
`;

const containerStyles = css`
  background-color: white;
  width: 100%;
  display: block;
  height: 100%;

  div:focus {
    outline: none !important;
  }

  button {
    cursor: pointer;
  }

  button,
  button:active,
  button:hover,
  button:focus,
  [type='button']:focus {
    outline: none !important;
  }

  button:disabled {
    cursor: default;
  }

  * {
    -webkit-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-select: none;
  }
`;

interface InnerNMRiumContentsProps {
  isFullscreenEnabled: boolean;
  toggleFullscreen: () => void;
  emptyText: NMRiumProps['emptyText'];
  mainDivRef: RefObject<HTMLDivElement>;
  elementsWrapperRef: RefObject<HTMLDivElement>;
  rootRef: RefObject<HTMLDivElement>;
  viewerRef: RefObject<HTMLDivElement>;
}

export function InnerNMRiumContents(props: InnerNMRiumContentsProps) {
  const {
    isFullscreenEnabled,
    toggleFullscreen,
    emptyText,
    mainDivRef,
    elementsWrapperRef,
    rootRef,
    viewerRef,
  } = props;

  const { displayerMode } = useChartData();

  const preventContextMenuHandler = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!checkModifierKeyActivated(e)) {
        e.preventDefault();
      }
    },
    [],
  );

  return (
    <>
      <StateError />
      <div
        className="nmrium-container"
        ref={rootRef}
        css={containerStyles}
        onContextMenu={preventContextMenuHandler}
        style={{ height: '100%', width: '100%' }}
      >
        <DropZone>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'white',
              width: '100%',
            }}
          >
            <Header
              isFullscreenEnabled={isFullscreenEnabled}
              onEnableFullscreen={toggleFullscreen}
            />

            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                height: '100%',
              }}
            >
              <ToolBar />
              <SplitPaneWrapper>
                <div css={viewerContainerStyle}>
                  <KeysListenerTracker mainDivRef={mainDivRef} />
                  <div
                    id="nmrium-viewer"
                    data-testid="viewer"
                    ref={viewerRef}
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                    }}
                  >
                    <FloatMoleculeStructures />
                    {displayerMode === '1D' ? (
                      <Viewer1D emptyText={emptyText} />
                    ) : (
                      <Viewer2D emptyText={emptyText} />
                    )}
                  </div>
                </div>
                <Panels />
              </SplitPaneWrapper>

              <div
                ref={elementsWrapperRef}
                key={String(isFullscreenEnabled)}
                id="main-wrapper"
                style={{
                  position: 'absolute',
                  pointerEvents: 'none',
                  zIndex: 2,
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />
            </div>
          </div>
        </DropZone>
      </div>
    </>
  );
}
