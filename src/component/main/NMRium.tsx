import type {
  CustomWorkspaces,
  NMRiumCore,
  NmriumState,
  WorkspacePreferences as NMRiumPreferences,
} from '@zakodium/nmrium-core';
import type { FileCollection } from 'file-collection';
import type { ReactElement, ReactNode } from 'react';
import { forwardRef, memo } from 'react';
import type { ErrorBoundaryPropsWithComponent } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';
import { RootLayout } from 'react-science/ui';

import ErrorOverlay from './ErrorOverlay.js';
import { InnerNMRium } from './InnerNMRium.js';
import type { NMRiumRefAPI } from './NMRiumRefAPI.js';
import type { NMRiumChangeCb, NMRiumWorkspace } from './types.js';

export interface NMRiumProps {
  /**
   * If you choose to bind the state to the component, you have to use a valid one.
   * - It must have the latest version supported by the core used by the NMRium component.
   * - It must come from a read api of `nmrium-core`.
   * - It will be transmitted as-is to the state reducer of `NMRium` component.
   * - `aggregator` must also be provided.
   */
  state?: Partial<NmriumState>;

  /**
   * Each of the core read apis returns a file collection.
   * Sometimes with the `fileCollection` name (not in aggregated form), sometimes with `ium` or `aggregator` name (already aggregated).
   * `aggregator` is a meta file collection. Each user source of data is placed in his dedicated uuid folder.
   * In the UI, it means one drag n drop (with possibly multiple files) = one uuid folder.
   *
   * @example
   * ```ts
   * const {nmriumState, fileCollection, containsNmrium, selectorRoot} = core.read();
   * const aggregator = containsNmrium
   *   ? fileCollection
   *   : new FileCollection().appendFileCollection(fileCollection, selectorRoot);
   *
   * <NMRium state={nmriumState} aggregator={aggregator} />
   * ```
   *
   * ```ts
   * const [state, ium] = core.readNMRiumArchive();
   *
   * <NMRium state={state} aggregator={ium} />
   * ```
   *
   * ```ts
   * const [state, aggregator] = core.readNMRiumObject();
   * // const [state, aggregator] = core.readNMRiumFile();
   *
   * <NMRium state={state} aggregator={aggregator} />
   * ```
   *
   * ```ts
   * const [state, fileCollection, selectorRoot] = core.readFromWebSource();
   * const aggregator = new FileCollection().appendFileCollection(fileCollection, selectorRoot);
   *
   * <NMRium state={state} aggregator={aggregator} />
   * ```
   */
  aggregator?: FileCollection;

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
  core?: NMRiumCore;
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

  return <RootLayout style={{ width: '100%' }}>{children}</RootLayout>;
});

export const NMRium = memo(NMRiumBase);
