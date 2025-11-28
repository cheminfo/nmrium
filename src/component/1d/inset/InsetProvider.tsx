import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';

import type { Margin } from '../../reducer/Reducer.js';

import type { Inset } from './SpectraInsets.js';

export const insetMargin: Margin = {
  top: 10,
  right: 10,
  bottom: 30,
  left: 10,
} as const;

interface BaseInsetPagContextProps extends Pick<
  Inset,
  'xDomain' | 'yDomain' | 'id' | 'spectrumKey' | 'view'
> {
  width: number;
  height: number;
}

interface InsetPagContextProps extends BaseInsetPagContextProps {
  margin: Margin;
}

const InsetContext = createContext<InsetPagContextProps | null>(null);

export function useInsetOptions() {
  return useContext(InsetContext);
}
export function useIsInset() {
  return !!useContext(InsetContext);
}

interface InsetProviderProps extends BaseInsetPagContextProps {
  children: ReactNode;
}

export function InsetProvider(props: InsetProviderProps) {
  const {
    children,
    width,
    height,
    xDomain,
    yDomain,
    spectrumKey,
    id = 'primary',
    view,
  } = props;

  const state = useMemo(() => {
    return {
      width,
      height,
      margin: insetMargin,
      id,
      xDomain,
      yDomain,
      spectrumKey,
      view,
    };
  }, [height, id, spectrumKey, view, width, xDomain, yDomain]);

  return (
    <InsetContext.Provider value={state}>{children}</InsetContext.Provider>
  );
}
