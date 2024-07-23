import {
  useEffect,
  useReducer,
  useRef,
  useImperativeHandle,
  ForwardedRef,
} from 'react';
import { useFullscreen } from 'react-science/ui';

import { AssignmentProvider } from '../assignment';
import { GlobalProvider } from '../context/GlobalContext';
import { KeyModifiersProvider } from '../context/KeyModifierContext';
import { LoggerProvider } from '../context/LoggerContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import { ToasterProvider } from '../context/ToasterContext';
import { TopicMoleculeProvider } from '../context/TopicMoleculeContext';
import { AlertProvider } from '../elements/Alert';
import { ModalProvider } from '../elements/popup/Modal';
import { HighlightProvider } from '../highlight';
import { defaultGetSpinner, SpinnerProvider } from '../loader/SpinnerContext';
import preferencesReducer, {
  preferencesInitialState,
  initPreferencesState,
  readSettings,
} from '../reducer/preferences/preferencesReducer';
import { getBlob } from '../utility/export';

import { InnerNMRiumContents } from './InnerNMRiumContents';
import type { NMRiumProps, NMRiumRef } from './NMRium';
import NMRiumStateProvider from './NMRiumStateProvider';

type InnerNMRiumProps = Omit<NMRiumProps, 'onError'> & {
  innerRef: ForwardedRef<NMRiumRef>;
};

export function InnerNMRium({
  data: nmriumData,
  workspace,
  customWorkspaces,
  preferences,
  getSpinner = defaultGetSpinner,
  onChange,
  emptyText,
  innerRef,
}: InnerNMRiumProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const elementsWrapperRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const mainDivRef = useRef<HTMLDivElement>(null);
  const { isFullScreen } = useFullscreen();

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

  useImperativeHandle(
    innerRef,
    () => ({
      getSpectraViewerAsBlob: () => {
        return rootRef?.current ? getBlob(rootRef.current, 'nmrSVG') : null;
      },
    }),
    [],
  );

  return (
    <div
      ref={mainDivRef}
      style={{ height: '100%', position: 'relative' }}
      translate="no"
    >
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
                <NMRiumStateProvider
                  onChange={onChange}
                  nmriumData={nmriumData}
                >
                  <TopicMoleculeProvider>
                    <ModalProvider wrapperRef={elementsWrapperRef.current}>
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
                              />
                            </SpinnerProvider>
                          </AssignmentProvider>
                        </HighlightProvider>
                      </AlertProvider>
                    </ModalProvider>
                  </TopicMoleculeProvider>
                </NMRiumStateProvider>
              </ToasterProvider>
            </KeyModifiersProvider>
          </LoggerProvider>
        </PreferencesProvider>
      </GlobalProvider>
    </div>
  );
}
