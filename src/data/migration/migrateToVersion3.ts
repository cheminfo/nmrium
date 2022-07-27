/*
    * changes from version 2 to version 3:
       change the filters, replace the line broadening filter with the apodization filter and the order should apodization filter > zero filling instead of zero filling > line broadening

       - line broadening filter object
            {
              "name": "lineBroadening",
              "value": 1,
              ... other props
            }

      - apodization filter object

          {
            "name": "apodization",
            "value": {
              "lineBroadening": 1,
              "gaussBroadening": 0,
              "lineBroadeningCenter": 0
            },
            ... other props
          }

    */

const apodizationObject = {
  name: 'apodization',
  label: 'Apodization',
  value: {
    lineBroadening: 1,
    gaussBroadening: 0,
    lineBroadeningCenter: 0,
  },
};

export default function migrateToVersion3(data: any): any {
  if (data?.version === 3) return data;

  const newData = { ...data, version: 3 };

  for (const spectrum of newData.spectra) {
    if (Array.isArray(spectrum?.filters) && spectrum?.filters.length > 0) {
      // look for the index of lineBroadening filter
      const lineBroadeningFilterIndex = spectrum.filters.findIndex(
        (filter) => filter.name === 'lineBroadening',
      );

      if (lineBroadeningFilterIndex !== -1) {
        //replace lineBroadening filter with apodization filter and swipe zero filling filter with apodization filter
        const temp = {
          ...spectrum.filters[lineBroadeningFilterIndex],
          ...apodizationObject,
        };
        spectrum.filters[lineBroadeningFilterIndex] =
          spectrum.filters[lineBroadeningFilterIndex - 1];
        spectrum.filters[lineBroadeningFilterIndex - 1] = temp;
      }
    }
  }

  return newData;
}
