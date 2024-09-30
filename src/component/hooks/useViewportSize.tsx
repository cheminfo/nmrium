import { useExportSettings } from '../elements/export';
import { usePrintPage } from '../elements/print';

export function useViewportSize() {
  const printOptions = usePrintPage();
  const exportOptions = useExportSettings();

  return printOptions || exportOptions;
}
