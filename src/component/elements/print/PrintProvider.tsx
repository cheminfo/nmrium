import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';

export interface PrintPagContextProps {
  width: number;
  height: number;
}

const PrintContext = createContext<PrintPagContextProps | null>(null);

export function usePrintPage() {
  return useContext(PrintContext);
}

interface PrintProviderProps extends PrintPagContextProps {
  children: ReactNode;
  margin: number;
}
/**
 * Converts centimetre to pixels.
 * @param cm - The value in centimetre.
 * @param ppi - Pixels per inch (default is 96).
 * @returns The value in pixels.
 */
function cmToPx(cm: number, margin: number, ppi = 96) {
  const inches = (cm - margin * 2) / 2.54;
  return Math.round(inches * ppi);
}

export function PrintProvider(props: PrintProviderProps) {
  const { children, width, height, margin } = props;

  const state = useMemo(() => {
    const w = cmToPx(width, margin);
    const h = cmToPx(height, margin);
    return {
      width: w,
      height: h,
    };
  }, [height, margin, width]);

  return (
    <PrintContext.Provider value={state}>{children}</PrintContext.Provider>
  );
}
