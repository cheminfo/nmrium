import type {
  CustomWorkspaces,
  WorkspacePreferences as NMRiumPreferences,
} from 'nmr-load-save';
import { forwardRef, memo, ReactElement, ReactNode } from 'react';
import {
  ErrorBoundary,
  ErrorBoundaryPropsWithComponent,
} from 'react-error-boundary';
import { FullScreenProvider, RootLayout } from 'react-science/ui';

import ErrorOverlay from './ErrorOverlay.js';
import { InnerNMRium } from './InnerNMRium.js';
import { NMRiumRefAPI } from './NMRiumRefAPI.js';
import { NMRiumChangeCb, NMRiumData, NMRiumWorkspace } from './types.js';

export interface NMRiumProps {
  data?: NMRiumData;
  onChange?: NMRiumChangeCb;
  noErrorBoundary?: boolean;
  onError?: ErrorBoundaryPropsWithComponent['onError'];
  workspace?: NMRiumWorkspace;
  customWorkspaces?: CustomWorkspaces;
  preferences?: NMRiumPreferences;
  emptyText?: ReactNode;
  /**
   * Returns a custom spinner that will be rendered while loading data.
   */
  getSpinner?: () => ReactElement;
}

const NMRiumBase = forwardRef<NMRiumRefAPI, NMRiumProps>(function NMRium(
  props: NMRiumProps,
  ref,
) {
  const { noErrorBoundary = false, onError, ...otherProps } = props;

  const innerNmrium = <InnerNMRium {...otherProps} apiRef={ref} />;

  const children = noErrorBoundary ? (
    innerNmrium
  ) : (
    <ErrorBoundary FallbackComponent={ErrorOverlay} onError={onError}>
      {innerNmrium}
    </ErrorBoundary>
  );

  return (
    <FullScreenProvider>
      <RootLayout style={{ width: '100%' }}>{children}</RootLayout>
    </FullScreenProvider>
  );
});

export const NMRium = memo(NMRiumBase);
