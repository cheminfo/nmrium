import { DataExportOptionsType } from '../../SpectraManager';
import { Datum1D } from '../../types/data1d/Datum1D';

export function toJSON(datum1D: Datum1D, dataType: DataExportOptionsType) {
  return {
    id: datum1D.id,
    display: datum1D.display,
    ...(dataType === 'ROW_DATA' ||
    (dataType === 'DATA_SOURCE' && !datum1D.source.files)
      ? {
          data: datum1D.originalData,
          info: datum1D.originalInfo,
          meta: datum1D.meta,
          metaInfo: datum1D.metaInfo,
        }
      : {
          source: {
            files: datum1D.source.files,
            filter: datum1D.source.filter,
          },
        }),
    peaks: datum1D.peaks,
    integrals: datum1D.integrals,
    ranges: datum1D.ranges,
    filters: datum1D.filters,
  };
}
