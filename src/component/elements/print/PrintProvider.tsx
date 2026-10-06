import type { ReactNode } from 'react';
import { createContext, use, useMemo } from 'react';

interface PrintPagContextProps {
  width: number;
  height: number;
}

const PrintContext = createContext<PrintPagContextProps | null>(null);

export function usePrintPage() {
  return use(PrintContext);
}

interface PrintProviderProps extends PrintPagContextProps {
  children: ReactNode;
  margin: number;
}
/**
 * Converts centimetre to pixels.
 * @param cm - The value in centimetre.
 * @param margin
 * @returns The value in pixels.
 */
function cmToPx(cm: number, margin: number) {
  const inches = (cm - margin * 2) / 2.54;
  return Math.round(inches * 96);
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

  return <PrintContext value={state}>{children}</PrintContext>;
}
