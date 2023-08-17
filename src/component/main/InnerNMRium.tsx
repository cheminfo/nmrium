import {
  useEffect,
  useReducer,
  useRef,
  useImperativeHandle,
  ForwardedRef,
} from 'react';
import { useOnOff } from 'react-science/ui';
import { useFullscreen } from 'react-use';

import { AssignmentProvider } from '../assignment';
import { GlobalProvider } from '../context/GlobalContext';
import { KeyModifiersProvider } from '../context/KeyModifierContext';
import { LoggerProvider } from '../context/LoggerContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import { AlertProvider } from '../elements/popup/Alert';
import { ModalProvider } from '../elements/popup/Modal';
import { HighlightProvider } from '../highlight';
import { defaultGetSpinner, SpinnerProvider } from '../loader/SpinnerContext';
import preferencesReducer, {
  preferencesInitialState,
  initPreferencesState,
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
  const [enableFullscreen, , disableFullscreen, toggleFullscreen] =
    useOnOff(false);
  const mainDivRef = useRef<HTMLDivElement>(null);

  const isFullscreenEnabled = useFullscreen(rootRef, enableFullscreen, {
    onClose: disableFullscreen,
  });

  const [preferencesState, dispatchPreferences] = useReducer(
    preferencesReducer,
    preferencesInitialState,
    initPreferencesState,
  );

  useEffect(() => {
    rootRef.current?.focus();
  }, [isFullscreenEnabled]);

  useEffect(() => {
    dispatchPreferences({
      type: 'INIT_PREFERENCES',
      payload: {
        preferences,
        workspace,
        customWorkspaces,
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
    <div ref={mainDivRef} style={{ height: '100%', position: 'relative' }}>
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
              <AlertProvider wrapperRef={elementsWrapperRef.current}>
                <NMRiumStateProvider
                  onChange={onChange}
                  nmriumData={nmriumData}
                >
                  <ModalProvider wrapperRef={elementsWrapperRef.current}>
                    <HighlightProvider>
                      <AssignmentProvider>
                        <SpinnerProvider value={getSpinner}>
                          <InnerNMRiumContents
                            isFullscreenEnabled={isFullscreenEnabled}
                            toggleFullscreen={toggleFullscreen}
                            emptyText={emptyText}
                            mainDivRef={mainDivRef}
                            elementsWrapperRef={elementsWrapperRef}
                            rootRef={rootRef}
                            viewerRef={viewerRef}
                          />
                        </SpinnerProvider>
                      </AssignmentProvider>
                    </HighlightProvider>
                  </ModalProvider>
                </NMRiumStateProvider>
              </AlertProvider>
            </KeyModifiersProvider>
          </LoggerProvider>
        </PreferencesProvider>
      </GlobalProvider>
    </div>
  );
}
