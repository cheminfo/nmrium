import { useExportSettings } from '../elements/export/index.js';
import { usePrintPage } from '../elements/print/index.js';

export function useViewportSize() {
  const printOptions = usePrintPage();
  const exportOptions = useExportSettings();

  return printOptions || exportOptions;
}
export function useCheckExportStatus() {
  const printOptions = usePrintPage();
  const exportOptions = useExportSettings();

  return !!(printOptions || exportOptions);
}
