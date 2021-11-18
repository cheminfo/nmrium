import * as FiltersManager from '../../FiltersManager';
import { Datum2D } from '../../types/data2d';
import generateID from '../../utilities/generateID';
import { get2DColor } from '../../utilities/getColor';
import Processing2D, { defaultContourOptions } from '../Processing2D';

export function initiateDatum2D(options: any, usedColors = {}): Datum2D {
  const datum: any = {};

  datum.id = options.id || generateID();
  datum.source = Object.assign(
    {
      jcampURL: null,
    },
    options.source,
  );
  datum.display = Object.assign(
    {
      name: options.display?.name ? options.display.name : generateID(),
      ...getColor(options, usedColors),
      isPositiveVisible: true,
      isNegativeVisible: true,
      isVisible: true,
      contourOptions: defaultContourOptions,
      dimension: 2,
    },
    options.display,
  );

  datum.info = Object.assign(
    {
      nucleus: ['1H', '1H'],
      isFt: true,
      isFid: false,
      isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
      dimension: 2,
    },
    options.info,
  );

  datum.originalInfo = datum.info;
  datum.meta = Object.assign({}, options.meta);
  datum.data = Object.assign(
    {
      z: [],
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
    },
    options.data,
  );
  datum.originalData = datum.data;
  datum.filters = Object.assign([], options.filters);

  datum.zones = Object.assign({ values: [], options: {} }, options.zones);

  datum.processingController = new Processing2D(
    datum.data,
    datum.display.contourOptions,
  );

  //reapply filters after load the original data
  FiltersManager.reapplyFilters(datum);

  return datum;
}

function getColor(options, usedColors) {
  let color = { positiveColor: 'red', negativeColor: 'blue' };
  if (
    options.display === undefined ||
    options.display.negativeColor === undefined ||
    options.display.positiveColor === undefined
  ) {
    color = get2DColor(options.info.experiment, usedColors['2d'] || []);
  }

  if (usedColors['2d']) {
    usedColors['2d'].push(color.positiveColor);
  }
  return color;
}
