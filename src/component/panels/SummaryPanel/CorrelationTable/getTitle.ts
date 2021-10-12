export default function getTitle(correlation) {
  return (
    correlation.pseudo === false &&
    // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
    [correlation.experimentType.toUpperCase()]
      .concat(
        correlation.link.reduce((arr, link) => {
          if (
            link.pseudo === false &&
            link.experimentType !== correlation.experimentType &&
            !arr.includes(link.experimentType.toUpperCase())
          ) {
            arr.push(link.experimentType.toUpperCase());
          }
          return arr;
        }, []),
      )
      .sort()
      .join('/')
  );
}
