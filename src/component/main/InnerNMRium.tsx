import { init } from '@zakodium/nmrium-core-plugins';
import type { ForwardedRef } from 'react';
import { useMemo, useEffect, useReducer, useRef } from 'react';
import { useFullscreen } from 'react-science/ui';

import { AssignmentProvider } from '../assignment/AssignmentProvider.js';
import { CoreProvider } from '../context/CoreContext.js';
import { GlobalProvider } from '../context/GlobalContext.js';
import { KeyModifiersProvider } from '../context/KeyModifierContext.js';
import { LoggerProvider } from '../context/LoggerContext.js';
import { PreferencesProvider } from '../context/PreferencesContext.js';
import { SortSpectraProvider } from '../context/SortSpectraContext.js';
import { ToasterProvider } from '../context/ToasterContext.js';
import { TopicMoleculeProvider } from '../context/TopicMoleculeContext.js';
import { AlertProvider } from '../elements/Alert.js';
import { DialogProvider } from '../elements/DialogManager.js';
import { ExportManagerProvider } from '../elements/export/ExportManager.js';
import { HighlightProvider } from '../highlight/index.js';
import {
  defaultGetSpinner,
  SpinnerProvider,
} from '../loader/SpinnerContext.js';
import preferencesReducer, {
  initPreferencesState,
  preferencesInitialState,
  readSettings,
} from '../reducer/preferences/preferencesReducer.js';

import { InnerNMRiumContents } from './InnerNMRiumContents.js';
import type { NMRiumProps } from './NMRium.js';
import type { NMRiumRefAPI } from './NMRiumRefAPI.js';
import NMRiumStateProvider from './NMRiumStateProvider.js';

type InnerNMRiumProps = Omit<NMRiumProps, 'onError'> & {
  apiRef: ForwardedRef<NMRiumRefAPI>;
};

export function InnerNMRium(props: InnerNMRiumProps) {
  const {
    data: nmriumData,
    workspace,
    customWorkspaces,
    preferences,
    getSpinner = defaultGetSpinner,
    onChange,
    emptyText,
    apiRef,
    core,
  } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const elementsWrapperRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const mainDivRef = useRef<HTMLDivElement>(null);
  const { isFullScreen } = useFullscreen();

  const finalCore = useMemo(() => {
    if (!core) return init();

    return core;
  }, [core]);

  const [preferencesState, dispatchPreferences] = useReducer(
    preferencesReducer,
    preferencesInitialState,
    initPreferencesState,
  );

  useEffect(() => {
    rootRef.current?.focus();
  }, [isFullScreen]);

  useEffect(() => {
    const settings = readSettings();
    dispatchPreferences({
      type: 'INIT_PREFERENCES',
      payload: {
        preferences,
        workspace,
        customWorkspaces,
        currentWorkspace: settings?.currentWorkspace,
        dispatch: dispatchPreferences,
      },
    });
  }, [customWorkspaces, preferences, workspace]);

  return (
    <div
      ref={mainDivRef}
      style={{ height: '100%', position: 'relative' }}
      translate="no"
    >
      <CoreProvider value={finalCore}>
        <ExportManagerProvider>
          <GlobalProvider
            value={{
              rootRef: rootRef.current,
              elementsWrapperRef: elementsWrapperRef.current,
              viewerRef: viewerRef.current,
            }}
          >
            <PreferencesProvider value={preferencesState}>
              <LoggerProvider>
                <KeyModifiersProvider>
                  <ToasterProvider>
                    <SortSpectraProvider>
                      <NMRiumStateProvider
                        onChange={onChange}
                        nmriumData={nmriumData}
                      >
                        <TopicMoleculeProvider>
                          <DialogProvider>
                            <AlertProvider>
                              <HighlightProvider>
                                <AssignmentProvider>
                                  <SpinnerProvider value={getSpinner}>
                                    <InnerNMRiumContents
                                      emptyText={emptyText}
                                      mainDivRef={mainDivRef}
                                      elementsWrapperRef={elementsWrapperRef}
                                      rootRef={rootRef}
                                      viewerRef={viewerRef}
                                      apiRef={apiRef}
                                    />
                                  </SpinnerProvider>
                                </AssignmentProvider>
                              </HighlightProvider>
                            </AlertProvider>
                          </DialogProvider>
                        </TopicMoleculeProvider>
                      </NMRiumStateProvider>
                    </SortSpectraProvider>
                  </ToasterProvider>
                </KeyModifiersProvider>
              </LoggerProvider>
            </PreferencesProvider>
          </GlobalProvider>
        </ExportManagerProvider>
      </CoreProvider>
    </div>
  );
}
