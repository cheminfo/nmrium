import { useInsetOptions } from '../1d/inset/InsetProvider.js';
import { useExportSettings } from '../elements/export/index.js';
import { usePrintPage } from '../elements/print/index.js';
import type { Margin } from '../reducer/Reducer.js';

export function useViewportSize(): {
  width: number;
  height: number;
  margin?: Margin;
  xDomain?: number[];
  yDomain?: number[];
} | null {
  const printOptions = usePrintPage();
  const exportOptions = useExportSettings();
  const insetOptions = useInsetOptions();

  return insetOptions || printOptions || exportOptions;
}
export function useCheckExportStatus() {
  const printOptions = usePrintPage();
  const exportOptions = useExportSettings();

  return !!(printOptions || exportOptions);
}
