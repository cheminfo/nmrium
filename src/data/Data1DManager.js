import applyFilter from './filter1d/filter';
import { convert } from 'jcampconverter';
import { Datum1D } from './Datum1D';

export class Data1DManager {
  static data1D = [];

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

  static pushDatum1D(object) {
    Data1DManager.data1D.push(object);
  }

  static getDatum1D(id) {
    return Data1DManager.data1D.find((ob) => ob.id === id);
  }

  static getXYData() {
    return Data1DManager.data1D.map((ob) => {
      return {
        id: ob.id,
        x: ob.x,
        y: ob.re,
        name: ob.name,
        color: ob.color,
        isVisible: ob.isVisible,
        isPeaksMarkersVisible: ob.isPeaksMarkersVisible,
        nucleus:ob.nucleus
      };
    });
  }

  static getOriginalData() {
    return Data1DManager.data1D.map((ob) => {
      return {
        id: ob.id,
        x: ob.x,
        y: ob.re,
        name: ob.name,
        color: ob.color,
        isVisible: ob.isVisible,
        isPeaksMarkersVisible: ob.isPeaksMarkersVisible,
        nucleus:ob.nucleus

      };
    });
  }

  static undoFilter(pastChainFilters = []) {
    // let data = { x: this.original.x, y: this.original.re };
    Data1DManager.data1D.forEach((ob) => {
      ob.x = ob.original.x;
      ob.re = ob.original.re;
    });

    if (pastChainFilters && pastChainFilters.length !== 0) {
      pastChainFilters.forEach((filter) => {
        const ob = Data1DManager.getDatum1D(filter.id);
        let data = { x: ob.x, y: ob.re };
        data = applyFilter({ kind: filter.kind, value: filter.value }, data);
        Data1DManager.getDatum1D(filter.id).x = data.x;
        Data1DManager.getDatum1D(filter.id).re = data.y;
      });

      // this.x = data.x;
      // this.re = data.y;
    }
  }

  static redoFilter(nextFilter) {
    const ob = Data1DManager.getDatum1D(nextFilter.id);

    let data = { x: ob.x, y: ob.re };
    data = applyFilter(
      { kind: nextFilter.kind, value: nextFilter.value },
      data,
    );
    ob.x = data.x;
    ob.re = data.y;
  }
}
