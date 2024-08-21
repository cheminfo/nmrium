/** @jsxImportSource @emotion/react */

import { Global, css } from '@emotion/react';
import { PrintPageOptions } from 'nmr-load-save';
import {
  ForwardedRef,
  MouseEvent,
  ReactNode,
  RefObject,
  useCallback,
} from 'react';
import { useFullscreen } from 'react-science/ui';

import checkModifierKeyActivated from '../../data/utilities/checkModifierKeyActivated';
import KeysListenerTracker from '../EventsTrackers/KeysListenerTracker';
import { usePreferences } from '../context/PreferencesContext';
import { PrintContent } from '../elements/print/PrintContent';
import Header from '../header/Header';
import DropZone from '../loader/DropZone';
import Panels from '../panels/Panels';
import ToolBar from '../toolbar/ToolBar';

import { useNMRiumRefAPI } from './NMRiumRefAPI';
import { NMRiumViewer } from './NMRiumViewer';
import { SplitPaneWrapper } from './SplitPaneWrapper';
import { StateError } from './StateError';

import { NMRiumProps, NMRiumRefAPI } from '.';

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
  apiRef: ForwardedRef<NMRiumRefAPI>;
}

export function InnerNMRiumContents(props: InnerNMRiumContentsProps) {
  const {
    emptyText,
    mainDivRef,
    elementsWrapperRef,
    rootRef,
    viewerRef,
    apiRef,
  } = props;

  const { isFullScreen } = useFullscreen();

  const preventContextMenuHandler = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!checkModifierKeyActivated(e)) {
        e.preventDefault();
      }
    },
    [],
  );

  useNMRiumRefAPI(apiRef, rootRef);

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

          .popover-tab {
            background-color: transparent;
            box-shadow: none;
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
        <PrintWrapper>
          <NMRiumViewer emptyText={emptyText} viewerRef={viewerRef} />
        </PrintWrapper>
      </div>
    </>
  );
}

interface PrintWrapperProps {
  children: ReactNode;
}

function PrintWrapper(props: PrintWrapperProps) {
  const { children } = props;
  const {
    current: { printPageOptions },
    dispatch,
  } = usePreferences();

  function handleSavePrintOptions(options: PrintPageOptions) {
    dispatch({ type: 'CHANGE_PRINT_PAGE_SETTINGS', payload: options });
  }

  return (
    <PrintContent
      defaultPrintPageOptions={printPageOptions}
      onPrint={handleSavePrintOptions}
    >
      {children}
    </PrintContent>
  );
}
