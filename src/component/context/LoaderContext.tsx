import { noop } from '@zakodium/utils';
import { createContext, use } from 'react';

export const LoaderContext = createContext<() => void>(noop);

export function useLoader() {
  return use(LoaderContext);
}
