import { HotkeysProvider } from '@blueprintjs/core';
import { init } from '@zakodium/nmrium-core-plugins';
import type { Ref } from 'react';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useFullscreen } from 'react-science/ui';

import { AssignmentProvider } from '../assignment/AssignmentProvider.js';
import { CoreContext } from '../context/CoreContext.js';
import { GlobalContext } from '../context/GlobalContext.js';
import { KeyModifiersProvider } from '../context/KeyModifierContext.js';
import { LoggerProvider } from '../context/LoggerContext.js';
import type { PreferencesStateContext } from '../context/PreferencesContext.js';
import { PreferencesContext } from '../context/PreferencesContext.js';
import { SortSpectraProvider } from '../context/SortSpectraContext.js';
import { ToasterProvider } from '../context/ToasterContext.js';
import { TopicMoleculeProvider } from '../context/TopicMoleculeContext.js';
import { AlertProvider } from '../elements/Alert.js';
import { DialogProvider } from '../elements/DialogManager.js';
import { ExportManagerProvider } from '../elements/export/ExportManager.js';
import { HighlightProvider } from '../highlight/index.js';
import { SpinnerContext, defaultGetSpinner } from '../loader/SpinnerContext.js';
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
  apiRef?: Ref<NMRiumRefAPI>;
};

export function InnerNMRium(props: InnerNMRiumProps) {
  const {
    state,
    aggregator,
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

  const preferencesProviderValue = useMemo<PreferencesStateContext>(() => {
    return { ...preferencesState, dispatch: dispatchPreferences };
  }, [preferencesState]);

  useEffect(() => {
    rootRef.current?.focus();
  }, [isFullScreen]);

  const refreshPreferences = useCallback(() => {
    const settings = readSettings();
    dispatchPreferences({
      type: 'INIT_PREFERENCES',
      payload: {
        preferences,
        workspace,
        customWorkspaces,
        currentWorkspace: settings?.currentWorkspace,
      },
    });
  }, [customWorkspaces, preferences, workspace]);

  const globalRef = useMemo(
    () => ({
      rootRef: rootRef.current,
      elementsWrapperRef: elementsWrapperRef.current,
      viewerRef: viewerRef.current,
    }),
    // TODO: Implement this differently as it's invalid to read `ref.current` during rendering.
    // eslint-disable-next-line @eslint-react/exhaustive-deps,react-hooks/exhaustive-deps
    [rootRef.current, elementsWrapperRef.current, viewerRef.current],
  );

  return (
    <div
      ref={mainDivRef}
      style={{ height: '100%', position: 'relative' }}
      translate="no"
    >
      <CoreContext value={finalCore}>
        <HotkeysProvider>
          <ExportManagerProvider>
            <GlobalContext value={globalRef}>
              <PreferencesContext value={preferencesProviderValue}>
                <LoggerProvider>
                  <KeyModifiersProvider>
                    <ToasterProvider>
                      <SortSpectraProvider>
                        <NMRiumStateProvider
                          onChange={onChange}
                          state={state}
                          aggregator={aggregator}
                          refreshPreferences={refreshPreferences}
                        >
                          <TopicMoleculeProvider>
                            <DialogProvider>
                              <AlertProvider>
                                <HighlightProvider>
                                  <AssignmentProvider>
                                    <SpinnerContext value={getSpinner}>
                                      <InnerNMRiumContents
                                        emptyText={emptyText}
                                        mainDivRef={mainDivRef}
                                        elementsWrapperRef={elementsWrapperRef}
                                        rootRef={rootRef}
                                        viewerRef={viewerRef}
                                        apiRef={apiRef}
                                      />
                                    </SpinnerContext>
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
              </PreferencesContext>
            </GlobalContext>
          </ExportManagerProvider>
        </HotkeysProvider>
      </CoreContext>
    </div>
  );
}
