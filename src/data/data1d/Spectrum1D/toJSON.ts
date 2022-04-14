import { DataExportOptions, DataExportOptionsType } from '../../SpectraManager';
import { Datum1D } from '../../types/data1d/Datum1D';

export function toJSON(
  datum1D: Datum1D,
  dataExportOption: DataExportOptionsType,
) {
  return {
    id: datum1D.id,
    display: datum1D.display,
    ...(dataExportOption === DataExportOptions.ROW_DATA ||
    (dataExportOption === DataExportOptions.DATA_SOURCE &&
      !datum1D.source.jcampURL)
      ? {
          data: datum1D.originalData,
          info: datum1D.originalInfo,
          meta: datum1D.meta,
          source: {
            jcampURL: null,
          },
        }
      : {
          source: {
            jcampURL: datum1D.source.jcampURL,
            jcampSpectrumIndex: datum1D.source.jcampSpectrumIndex,
          },
        }),
    peaks: datum1D.peaks,
    integrals: datum1D.integrals,
    ranges: datum1D.ranges,
    filters: datum1D.filters,
  };
}
