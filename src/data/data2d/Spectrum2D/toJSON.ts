import { DataExportOptions, DataExportOptionsType } from '../../SpectraManager';
import { Datum2D } from '../../types/data2d';

export function toJSON(
  datum: Datum2D,
  dataExportOption: DataExportOptionsType,
) {
  return {
    id: datum.id,

    ...(dataExportOption === DataExportOptions.ROW_DATA ||
    (dataExportOption === DataExportOptions.DATA_SOURCE &&
      !datum.source.jcampURL)
      ? {
          data: datum.originalData,
          info: datum.originalInfo,
          meta: datum.meta,
          source: {
            jcampURL: null,
          },
        }
      : {
          source: {
            jcampURL: datum.source.jcampURL,
          },
        }),
    zones: datum.zones,
    filters: datum.filters,
    display: datum.display,
  };
}
