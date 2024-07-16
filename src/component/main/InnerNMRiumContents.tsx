/** @jsxImportSource @emotion/react */

import { Global, css } from '@emotion/react';
import {
  MouseEvent,
  RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import { useFullscreen } from 'react-science/ui';

import checkModifierKeyActivated from '../../data/utilities/checkModifierKeyActivated';
import KeysListenerTracker from '../EventsTrackers/KeysListenerTracker';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { PrintContent } from '../elements/PrintContent';
import Header from '../header/Header';
import DropZone from '../loader/DropZone';
import Panels from '../panels/Panels';
import ToolBar from '../toolbar/ToolBar';

import { NMRiumViewer } from './NMRiumViewer';
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

  .actions-buttons-popover {
    background: transparent;
    padding: 5px;
    box-shadow: none;
  }
`;

interface InnerNMRiumContentsProps {
  emptyText: NMRiumProps['emptyText'];
  mainDivRef: RefObject<HTMLDivElement>;
  elementsWrapperRef: RefObject<HTMLDivElement>;
  rootRef: RefObject<HTMLDivElement>;
  viewerRef: RefObject<HTMLDivElement>;
}

export function InnerNMRiumContents(props: InnerNMRiumContentsProps) {
  const { emptyText, mainDivRef, elementsWrapperRef, rootRef, viewerRef } =
    props;

  const { isFullScreen } = useFullscreen();

  const preventContextMenuHandler = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!checkModifierKeyActivated(e)) {
        e.preventDefault();
      }
    },
    [],
  );

  const beforePrintSize = useRef<{ width: number; height: number } | null>();

  const dispatch = useDispatch();
  function handleBeforePrint(size) {
    beforePrintSize.current = size;
    console.log(size);
  }

  function handleAfterPrint() {
    if (!beforePrintSize.current) return;
    dispatch({
      type: 'SET_DIMENSIONS',
      payload: { ...beforePrintSize.current },
    });
    beforePrintSize.current = null;
  }

  return (
    <>
      <StateError />
      <Global
        styles={css`
          .actions-buttons-popover {
            border-radius: 10px;
            padding: 5px;
            background-color: white;
          }
        `}
      />
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
            <Header />

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

                  <NMRiumViewer emptyText={emptyText} viewerRef={viewerRef} />
                </div>
                <Panels />
              </SplitPaneWrapper>

              <div
                ref={elementsWrapperRef}
                key={String(isFullScreen)}
                id="main-wrapper"
                style={{
                  position: 'absolute',
                  pointerEvents: 'none',
                  zIndex: 10,
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />
            </div>
          </div>
        </DropZone>
        <div />
        <PrintContent onAfterPrint={handleAfterPrint}>
          <PrintWrapper
            emptyText={emptyText}
            onBeforePrint={handleBeforePrint}
            viewerRef={viewerRef}
          />
        </PrintContent>
      </div>
    </>
  );
}

function PrintWrapper(
  props: Pick<InnerNMRiumContentsProps, 'emptyText' | 'viewerRef'> & {
    onBeforePrint: (size) => void;
  },
) {
  const { emptyText, viewerRef, onBeforePrint } = props;
  const { width, height } = useChartData();

  useLayoutEffect(() => {
    onBeforePrint({ width, height });
  }, []);

  return <NMRiumViewer emptyText={emptyText} viewerRef={viewerRef} />;
}
