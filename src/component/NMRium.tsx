/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { RootLayout } from 'analysis-ui-components';
import { CorrelationData } from 'nmr-correlation';
import {
  useEffect,
  useReducer,
  useMemo,
  useRef,
  memo,
  Reducer,
  ReactElement,
  ReactNode,
  forwardRef,
  useImperativeHandle,
  ForwardedRef,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useToggle, useFullscreen } from 'react-use';

import { toJSON } from '../data/SpectraManager';
import { Datum1D } from '../data/types/data1d';
import { Datum2D } from '../data/types/data2d';
import { NMRiumDataReturn } from '../types/NMRiumDataReturn';
import { NMRiumGeneralPreferences } from '../types/NMRiumGeneralPreferences';
import { NMRiumPanelPreferences } from '../types/NMRiumPanelPreferences';
import { NMRiumToolBarPreferences } from '../types/NMRiumToolBarPreferences';

import Viewer1D from './1d/Viewer1D';
import Viewer2D from './2d/Viewer2D';
import ErrorOverlay from './ErrorOverlay';
import { NMRiumContainer } from './NMRiumContainer';
import { SplitPaneWrapper } from './SplitPaneWrapper';
import { AssignmentProvider } from './assignment';
import { ChartDataProvider } from './context/ChartContext';
import { DispatchProvider } from './context/DispatchContext';
import { GlobalProvider } from './context/GlobalContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { AlertProvider } from './elements/popup/Alert';
import { ModalProvider } from './elements/popup/Modal';
import Header from './header/Header';
import { HighlightProvider } from './highlight';
import DropZone from './loader/DropZone';
import { defaultGetSpinner, SpinnerProvider } from './loader/SpinnerContext';
import Panels from './panels/Panels';
import checkActionType from './reducer/IgnoreActions';
import {
  spectrumReducer,
  initialState,
  dispatchMiddleware,
  initState,
  State,
  ViewState,
} from './reducer/Reducer';
import { DISPLAYER_MODE } from './reducer/core/Constants';
import preferencesReducer, {
  preferencesInitialState,
  PreferencesState,
  initPreferencesState,
} from './reducer/preferences/preferencesReducer';
import { INITIATE, SET_LOADING_FLAG } from './reducer/types/Types';
import ToolBar from './toolbar/ToolBar';
import { BlobObject, getBlob } from './utility/export';

const viewerContainerStyle = css`
  border: 0.55px #e6e6e6 solid;
  display: flex;
  flex: 1;
  flex-direction: 'column';
  height: 100%;
  margin-left: -1px;
`;

export type { NMRiumDataReturn } from '../types/NMRiumDataReturn';

export type NMRiumWorkspace =
  | 'exercise'
  | 'process1D'
  | 'default'
  | 'prediction'
  | 'embedded';

export interface NMRiumProps {
  data?: NMRiumData;
  onDataChange?: (data: NMRiumDataReturn) => void;
  onViewChange?: (view: ViewState) => void;
  workspace?: NMRiumWorkspace;
  preferences?: NMRiumPreferences;
  emptyText?: ReactNode;
  /**
   * Returns a custom spinner that will be rendered while loading data.
   */
  getSpinner?: () => ReactElement;
}

export type NMRiumPreferences = Partial<{
  general: Partial<NMRiumGeneralPreferences>;
  panels: Partial<NMRiumPanelPreferences>;
  toolBarButtons: Partial<NMRiumToolBarPreferences>;
}>;

export type Molecules = Array<{ molfile: string }>;
export type Spectra = Array<Datum1D | Datum2D>;

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface NMRiumData {
  molecules?: Molecules;
  spectra: DeepPartial<Spectra>;
  correlations?: CorrelationData;
}

const defaultPreferences = {};
const defaultData: NMRiumData = {
  spectra: [],
};

export interface NMRiumRef {
  getSpectraViewerAsBlob: () => BlobObject | null;
}

const NMRium = forwardRef<NMRiumRef, NMRiumProps>(function NMRium(props, ref) {
  return (
    <RootLayout style={{ width: '100%' }}>
      <ErrorBoundary FallbackComponent={ErrorOverlay}>
        <InnerNMRium {...props} innerRef={ref} />
      </ErrorBoundary>
    </RootLayout>
  );
});

function InnerNMRium({
  data: dataProp = defaultData,
  workspace,
  preferences = defaultPreferences,
  getSpinner = defaultGetSpinner,
  onDataChange,
  onViewChange,
  emptyText,
  innerRef,
}: NMRiumProps & { innerRef: ForwardedRef<NMRiumRef> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const elementsWrapperRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [show, toggle] = useToggle(false);

  const handleDataChange = useRef(onDataChange);
  useEffect(() => {
    handleDataChange.current = onDataChange;
  }, [onDataChange]);
  const handleViewChange = useRef(onViewChange);
  useEffect(() => {
    handleViewChange.current = onViewChange;
  }, [onViewChange]);

  const isFullscreen = useFullscreen(rootRef, show, {
    onClose: () => {
      toggle(false);
    },
  });

  const [state, dispatch] = useReducer<Reducer<State, any>, State>(
    spectrumReducer,
    initialState,
    initState,
  );

  const [preferencesState, dispatchPreferences] = useReducer<
    Reducer<PreferencesState, any>,
    PreferencesState
  >(preferencesReducer, preferencesInitialState, initPreferencesState);

  const { displayerMode, data: spectraData, actionType, view } = state;

  useEffect(() => {
    if (checkActionType(actionType)) {
      handleDataChange.current?.(toJSON(state, 'onDataChange'));
    }
  }, [actionType, state]);

  useEffect(() => {
    handleViewChange.current?.(view);
  }, [view]);

  const dispatchMiddleWare = useMemo(() => {
    return dispatchMiddleware(dispatch);
  }, []);

  useEffect(() => {
    rootRef.current?.focus();
  }, [isFullscreen]);

  useEffect(() => {
    dispatchPreferences({
      type: 'INIT_PREFERENCES',
      payload: {
        display: preferences,
        workspace,
        dispatch: dispatchPreferences,
      },
    });
  }, [preferences, workspace]);

  useImperativeHandle(
    innerRef,
    () => ({
      getSpectraViewerAsBlob: () => {
        return rootRef?.current ? getBlob(rootRef.current, 'nmrSVG') : null;
      },
    }),
    [],
  );

  useEffect(() => {
    dispatchMiddleWare({ type: SET_LOADING_FLAG, isLoading: true });
    if (dataProp) {
      dispatchMiddleWare({ type: INITIATE, payload: dataProp });
    }
  }, [dataProp, dispatchMiddleWare]);

  return (
    <GlobalProvider
      value={{
        rootRef: rootRef.current,
        elementsWrapperRef: elementsWrapperRef.current,
        viewerRef: viewerRef.current,
      }}
    >
      <PreferencesProvider value={preferencesState}>
        <div style={{ height: '100%', position: 'relative' }}>
          <AlertProvider wrapperRef={elementsWrapperRef.current}>
            <DispatchProvider value={dispatchMiddleWare}>
              <ChartDataProvider value={state}>
                <ModalProvider wrapperRef={elementsWrapperRef.current}>
                  <HighlightProvider>
                    <AssignmentProvider spectraData={spectraData}>
                      <SpinnerProvider value={getSpinner}>
                        <DropZone>
                          <NMRiumContainer ref={rootRef}>
                            <Header
                              isFullscreen={isFullscreen}
                              onMaximize={toggle}
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
                                  <div
                                    data-test-id="viewer"
                                    ref={viewerRef}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                    }}
                                  >
                                    {displayerMode === DISPLAYER_MODE.DM_1D ? (
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
                                key={String(isFullscreen)}
                                id="main-wrapper"
                                style={{
                                  position: 'absolute',
                                  pointerEvents: 'none',
                                  zIndex: 0,
                                  left: 0,
                                  right: 0,
                                  top: 0,
                                  bottom: 0,
                                }}
                              />
                            </div>
                          </NMRiumContainer>
                        </DropZone>
                      </SpinnerProvider>
                    </AssignmentProvider>
                  </HighlightProvider>
                </ModalProvider>
              </ChartDataProvider>
            </DispatchProvider>
          </AlertProvider>
        </div>
      </PreferencesProvider>
    </GlobalProvider>
  );
}
export default memo(NMRium);
