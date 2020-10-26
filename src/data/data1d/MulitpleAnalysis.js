import lodash from 'lodash';

import generateID from '../utilities/generateID';

import { Datum1D } from './Datum1D';

export class MultipleAnalysis {
  spectraAanalysis = {};

  constructor(spectra = []) {
    this.spectra = spectra;
  }

  analyzeSpectra(from, to, nucleus) {
    const result = this.spectra.reduce((acc, ob) => {
      if (ob instanceof Datum1D) {
        acc.push({ SID: ob.getID(), ...ob.detectRange(from, to) });
      }
      return acc;
    }, []);

    const colKey = generateID();
    const prevNucleusData = lodash.get(
      this.spectraAanalysis,
      `${nucleus}.values`,
      {},
    );
    const data = result.reduce((acc, row) => {
      acc[row.SID] = {
        ...prevNucleusData[row.SID],
        [`${row.from}-${row.to}`]: { colKey, ...row },
      };
      return acc;
    }, {});

    if (this.spectraAanalysis[nucleus] === undefined) {
      this.spectraAanalysis[nucleus] = { options: { sum: 100 }, values: {} };
    }
    const sum = this.spectraAanalysis[nucleus].options.sum;
    this.spectraAanalysis[nucleus].values = this.updateRelatives(data, sum);

    return lodash.cloneDeep(this.spectraAanalysis);
  }

  deleteSpectraAnalysis(rangeKey, nucleus) {
    const result = Object.entries(this.spectraAanalysis[nucleus].values).reduce(
      (acc, item) => {
        delete item[1][rangeKey];
        if (item[1] && Object.keys(item[1]).length > 0) {
          acc[item[0]] = item[1];
          return acc;
        }
        return acc;
      },
      {},
    );
    const sum = this.spectraAanalysis[nucleus].options.sum;
    this.spectraAanalysis[nucleus].values = this.updateRelatives(result, sum);

    return lodash.cloneDeep(this.spectraAanalysis);
  }

  updateRelatives(values, sum) {
    return Object.entries(values).reduce((spectraAcc, spectraItems) => {
      const currentSum = Object.values(spectraItems[1]).reduce(
        (acc, current) => {
          acc += Math.abs(current.absolute);
          return acc;
        },
        0,
      );
      const factor = currentSum > 0 ? sum / currentSum : 0.0;
      spectraAcc[spectraItems[0]] = Object.entries(spectraItems[1]).reduce(
        (rangeAcc, rangeItem) => {
          rangeAcc[rangeItem[0]] = {
            ...rangeItem[1],
            relative: Math.abs(rangeItem[1].absolute) * factor,
          };
          return rangeAcc;
        },
        {},
      );
      return spectraAcc;
    }, {});
  }
}
