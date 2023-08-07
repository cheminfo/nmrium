import type {
  CustomWorkspaces,
  WorkspacePreferences as NMRiumPreferences,
} from 'nmr-load-save';
import { memo, ReactElement, ReactNode, forwardRef } from 'react';
import {
  ErrorBoundary,
  ErrorBoundaryPropsWithComponent,
} from 'react-error-boundary';
import { RootLayout } from 'react-science/ui';

import { BlobObject } from '../utility/export';

import ErrorOverlay from './ErrorOverlay';
import { InnerNMRium } from './InnerNMRium';
import { NMRiumChangeCb, NMRiumData, NMRiumWorkspace } from './types';

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

export interface NMRiumRef {
  getSpectraViewerAsBlob: () => BlobObject | null;
}

const NMRiumBase = forwardRef<NMRiumRef, NMRiumProps>(function NMRium(
  props: NMRiumProps,
  ref,
) {
  const { noErrorBoundary = false, onError, ...otherProps } = props;

  const innerNmrium = <InnerNMRium {...otherProps} innerRef={ref} />;

  const children = noErrorBoundary ? (
    innerNmrium
  ) : (
    <ErrorBoundary FallbackComponent={ErrorOverlay} onError={onError}>
      {innerNmrium}
    </ErrorBoundary>
  );

  return <RootLayout style={{ width: '100%' }}>{children}</RootLayout>;
});

export const NMRium = memo(NMRiumBase);
