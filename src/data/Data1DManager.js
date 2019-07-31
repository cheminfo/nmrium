import applyFilter from './filter1d/filter';
import { convert } from 'jcampconverter';
import { Datum1D } from './Datum1D';

export class Data1DManager {
  static dataObjects = [];

  static fromJcamp = function fromJcamp(
    id,
    text,
    name,
    color,
    isVisible,
    isPeaksMarkersVisible,
  ) {
    let result = convert(text, { xy: true });

    let x =
      result.spectra[0] &&
      result.spectra[0].data &&
      result.spectra[0].data[0] &&
      result.spectra[0].data[0].y
        ? result.spectra[0].data[0].x
        : [];
    let re =
      result.spectra[0] &&
      result.spectra[0].data &&
      result.spectra[0].data[0] &&
      result.spectra[0].data[0].y
        ? result.spectra[0].data[0].y
        : [];
    let im =
      result.spectra[1] &&
      result.spectra[1].data &&
      result.spectra[1].data[0] &&
      result.spectra[1].data[0].y
        ? result.spectra[1].data[0].y
        : [];

    const ob = new Datum1D(
      id,
<<<<<<< HEAD
      { x: x, re: re, im: im },
      {
        display: {
          name: name,
          color: color,
          isVisible: isVisible,
          isPeaksMarkersVisible: isPeaksMarkersVisible,
        },
        meta: {
          nucleus: '1H',
          isFid: true,
        },
      },
=======
      x,
      re,
      im,
      name,
      color,
      isVisible,
      isPeaksMarkersVisible,
>>>>>>> 940dafa73fa9f946283af95385064028208ebfdb
    );

    return ob;
  };

  // static InitiateInstance(x, re, im) {
  //   if (Datum1D.myInstance === null) {
  //     Datum1D.myInstance = new Datum1D(x, re, im);
  //   } else {
  //     Datum1D.myInstance.setData(x, re, im)

  //   }

  //   return Datum1D.myInstance;
  // }

  static pushObject(object) {
    Data1DManager.dataObjects.push(object);
  }

  static getObject(id) {
    return Data1DManager.dataObjects.find((ob) => ob.id === id);
  }

  static getXYData() {
    return Data1DManager.dataObjects.map((ob) => {
      return {
        id: ob.id,
        x: ob.x,
        y: ob.re,
        name: ob.name,
        color: ob.color,
        isVisible: ob.isVisible,
        isPeaksMarkersVisible: ob.isPeaksMarkersVisible,
<<<<<<< HEAD
        nucleus:ob.nucleus
=======
>>>>>>> 940dafa73fa9f946283af95385064028208ebfdb
      };
    });
  }

  static getOriginalData() {
    return Data1DManager.dataObjects.map((ob) => {
      return {
        id: ob.id,
        x: ob.x,
        y: ob.re,
        name: ob.name,
        color: ob.color,
        isVisible: ob.isVisible,
        isPeaksMarkersVisible: ob.isPeaksMarkersVisible,
<<<<<<< HEAD
        nucleus:ob.nucleus

=======
>>>>>>> 940dafa73fa9f946283af95385064028208ebfdb
      };
    });
  }

  static undoFilter(pastChainFilters = []) {
    // let data = { x: this.original.x, y: this.original.re };
    Data1DManager.dataObjects.forEach((ob) => {
      ob.x = ob.original.x;
      ob.re = ob.original.re;
    });

    if (pastChainFilters.length !== 0) {
      pastChainFilters.forEach((filter) => {
        const ob = Data1DManager.getObject(filter.id);
        let data = { x: ob.x, y: ob.re };
        data = applyFilter({ kind: filter.kind, value: filter.value }, data);
        Data1DManager.getObject(filter.id).x = data.x;
        Data1DManager.getObject(filter.id).re = data.y;
      });

      // this.x = data.x;
      // this.re = data.y;
    }
  }

  static redoFilter(nextFilter) {
    const ob = Data1DManager.getObject(nextFilter.id);

    let data = { x: ob.x, y: ob.re };
    data = applyFilter(
      { kind: nextFilter.kind, value: nextFilter.value },
      data,
    );
    ob.x = data.x;
    ob.re = data.y;
  }
}
