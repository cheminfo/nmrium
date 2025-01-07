/** @jsxImportSource @emotion/react */

import { css, Global } from '@emotion/react';
import type { PrintPageOptions } from 'nmr-load-save';
import type { ForwardedRef, MouseEvent, ReactNode, RefObject } from 'react';
import { useCallback } from 'react';
import { useFullscreen } from 'react-science/ui';

import checkModifierKeyActivated from '../../data/utilities/checkModifierKeyActivated.js';
import KeysListenerTracker from '../EventsTrackers/KeysListenerTracker.js';
import { FilterSyncOptionsProvider } from '../context/FilterSyncOptionsContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { ExportManagerController } from '../elements/export/ExportManager.js';
import { PrintContent } from '../elements/print/PrintContent.js';
import { Header } from '../header/Header.js';
import DropZone from '../loader/DropZone.js';
import { Panels } from '../panels/Panels.js';
import { PanelsBar } from '../panels/PanelsBar.js';
import ToolBar from '../toolbar/ToolBar.js';

import { useNMRiumRefAPI } from './NMRiumRefAPI.js';
import { NMRiumViewer } from './NMRiumViewer.js';
import { SplitPaneWrapper } from './SplitPaneWrapper.js';
import { StateError } from './StateError.js';

import type { NMRiumProps, NMRiumRefAPI } from './index.js';

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
            box-shadow: none;

            div[class*='popover-content'] {
              background-color: transparent;
            }
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
        <FilterSyncOptionsProvider>
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
                <PanelsBar />
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
          <ExportManagerController>
            <NMRiumViewer emptyText={emptyText} viewerRef={viewerRef} />
          </ExportManagerController>
        </FilterSyncOptionsProvider>
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
