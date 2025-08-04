import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import type { PrintPageOptions } from '@zakodium/nmrium-core';
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
import { PanelOpenProviderProvider } from '../panels/Panels.js';
import { PanelsBar } from '../panels/PanelsBar.js';
import ToolBar from '../toolbar/ToolBar.js';

import { useNMRiumRefAPI } from './NMRiumRefAPI.js';
import { NMRiumViewer } from './NMRiumViewer.js';
import { NMRiumViewerWrapper } from './NMRiumViewerWrapper.js';
import { StateError } from './StateError.js';

import type { NMRiumProps, NMRiumRefAPI } from './index.js';

const NMRiumContainer = styled.div`
  background-color: white;
  display: block;
  height: 100%;
  width: 100%;

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

  /* Prevent text selection everywhere */
  * {
    user-select: none;
  }

  /* (Safari) Prevent dragging for non-draggable elements everywhere expect element with draggable attribute */
  *:not([draggable='true']) {
    -webkit-user-drag: none;
  }

  .actions-buttons-popover {
    background: transparent;
    box-shadow: none;
    padding: 5px;
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
            background-color: white;
            border-radius: 10px;
            padding: 5px;
          }

          .popover-tab {
            box-shadow: none;

            div[class*='popover-content'] {
              background-color: transparent;
            }
          }
        `}
      />
      <NMRiumContainer
        className="nmrium-container"
        ref={rootRef}
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
                <KeysListenerTracker mainDivRef={mainDivRef} />

                <PanelOpenProviderProvider>
                  <ToolBar />
                  <NMRiumViewerWrapper
                    viewerRef={viewerRef}
                    emptyText={emptyText}
                  />
                  <PanelsBar />
                </PanelOpenProviderProvider>
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
      </NMRiumContainer>
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
