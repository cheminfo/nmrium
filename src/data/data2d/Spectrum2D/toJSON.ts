import { DataExportOptionsType } from '../../SpectraManager';
import { Datum2D } from '../../types/data2d';

export function toJSON(datum: Datum2D, dataType: DataExportOptionsType) {
  return {
    id: datum.id,

    ...(dataType === 'ROW_DATA' ||
    (dataType === 'DATA_SOURCE' && !datum.source.files)
      ? {
          data: datum.originalData,
          info: datum.originalInfo,
          meta: datum.meta,
          metaInfo: datum.metaInfo,
        }
      : {
          source: datum.source,
        }),
    zones: datum.zones,
    filters: datum.filters,
    display: datum.display,
  };
}
