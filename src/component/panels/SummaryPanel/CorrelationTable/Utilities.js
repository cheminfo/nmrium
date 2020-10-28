import lodash from 'lodash';

const getAtomType = (nucleus) => nucleus.split(/\d+/)[1];

const getLabel = (correlation) => {
  let label = Object.keys(lodash.get(correlation, 'attached', {}))
    .map((otherAtomType) =>
      correlation.attached[otherAtomType]
        .map((index) => correlation.label[`${otherAtomType}${index + 1}`])
        .filter((_label) => _label),
    )
    .flat()
    .filter((_label, i, a) => a.indexOf(_label) === i)
    .sort((a, b) =>
      Number(a.split(/[a-z]+/i)[1]) - Number(b.split(/[a-z]+/i)[1]) < 0
        ? -1
        : Number(a.split(/[a-z]+/i)[1]) - Number(b.split(/[a-z]+/i)[1]) === 0 &&
          a.split(/\d+/)[1] < b.split(/\d+/)[1]
        ? -1
        : 1,
    )
    .join('/');

  if (label.length > 0) {
    return label;
  }

  return correlation.label.origin;
};

const getLabelStyle = (state, correlation) => {
  if (lodash.get(state, `atomType.${correlation.atomTypes[0]}.error`, false)) {
    const error = state.atomType[correlation.atomTypes[0]].error;
    if (
      lodash
        .get(error, 'outOfLimit', [])
        .some((index) => index === correlation.index)
    ) {
      return { color: 'red' };
    }
    if (
      lodash
        .get(error, 'notAttached', [])
        .some((index) => index === correlation.index)
    ) {
      return { color: 'blue' };
    }
    if (
      lodash
        .get(error, 'ambiguousAttachment', [])
        .some((index) => index === correlation.index)
    ) {
      return { color: 'orange' };
    }
  }

  return undefined;
};

const checkSignalMatch = (signal1, signal2, tolerance) =>
  signal1.delta - tolerance <= signal2.delta &&
  signal2.delta <= signal1.delta + tolerance;

const letters = [...Array(26).keys()].map((i) => String.fromCharCode(i + 97));

const attach = (
  correlations,
  correlationsAtomType,
  index,
  atomTypeToAttach,
  indicesToAttach,
) => {
  const correlation = correlationsAtomType[index];
  if (!lodash.get(correlation, `attached`, false)) {
    correlation.attached = {};
  }
  if (!lodash.get(correlation, `attached.${atomTypeToAttach}`, false)) {
    correlation.attached[atomTypeToAttach] = [];
  }
  correlation.attached[atomTypeToAttach] = correlation.attached[
    atomTypeToAttach
  ]
    .concat(indicesToAttach)
    .filter((index, i, a) => a.indexOf(index) === i);
  if (atomTypeToAttach === 'H') {
    correlation.attached[atomTypeToAttach].forEach((indexToAttach, n) => {
      if (lodash.get(correlations, `H[${indexToAttach}]`, false)) {
        correlations.H[indexToAttach].label[`C${index + 1}`] = `H${index + 1}${
          letters[n]
        }`;
      }
    });
  }
};

const setCorrelations = (signals, signals2D, tolerance) => {
  Object.keys(signals2D).forEach((experimentType) =>
    signals2D[experimentType].forEach((experiment, experimentIndex) =>
      experiment.signals.forEach((signal2D, i) =>
        experiment.atomTypes.forEach((atomType, dim) => {
          if (!lodash.get(signals, `${atomType}`, false)) {
            signals[atomType] = [];
          }
          const axis = dim === 0 ? 'x' : 'y';
          const matchedSignalIndices = signals[atomType]
            .map((signalAtomType, k) =>
              checkSignalMatch(
                signalAtomType.signal,
                signal2D.signal[axis],
                tolerance[atomType],
              )
                ? k
                : -1,
            )
            .filter((index) => index >= 0)
            .filter((index, i, a) => a.indexOf(index) === i);

          const correlation = {
            experimentType,
            experimentIndex,
            signalIndex: i,
            axis,
            atomTypes: experiment.atomTypes,
          };
          // in case of no signal match -> add new signal from 2D
          if (matchedSignalIndices.length === 0) {
            const newSignal = {
              experimentType,
              dimension: 1,
              atomTypes: [atomType],
              label: { origin: `${atomType}${signals[atomType].length + 1}` },
              signal: { delta: signal2D.signal[axis].delta },
              correlation: [correlation],
              index: signals[atomType].length,
            };
            signals[atomType].push(newSignal);
          } else {
            matchedSignalIndices.forEach((index) => {
              if (
                !signals[atomType][index].correlation.some(
                  (_correlation) =>
                    _correlation.experimentType ===
                      correlation.experimentType &&
                    _correlation.experimentIndex ===
                      correlation.experimentIndex &&
                    lodash.isEqual(
                      _correlation.atomTypes,
                      correlation.atomTypes,
                    ) &&
                    _correlation.signalIndex === correlation.signalIndex &&
                    _correlation.axis === correlation.axis,
                )
              ) {
                signals[atomType][index].correlation.push(correlation);
              }
            });
          }
        }),
      ),
    ),
  );
};

const setMatches = (signals) => {
  Object.keys(signals).forEach((atomType) =>
    signals[atomType].forEach((signal) =>
      signal.correlation.forEach((correlation) => {
        const otherAtomType =
          correlation.axis === 'x'
            ? correlation.atomTypes[1]
            : correlation.atomTypes[0];
        if (!lodash.get(correlation, 'match', false)) {
          correlation.match = [];
        }
        signals[otherAtomType].forEach((signalOtherAtomType, k) =>
          signalOtherAtomType.correlation.forEach(
            (correlationOtherAtomType) => {
              // check for correlation match and avoid possible duplicates
              if (
                correlationOtherAtomType.experimentType ===
                  correlation.experimentType &&
                correlationOtherAtomType.experimentIndex ===
                  correlation.experimentIndex &&
                lodash.isEqual(
                  correlationOtherAtomType.atomTypes,
                  correlation.atomTypes,
                ) &&
                correlationOtherAtomType.signalIndex ===
                  correlation.signalIndex &&
                correlationOtherAtomType.axis !== correlation.axis &&
                !correlation.match.some(
                  (match) =>
                    match.atomType === otherAtomType && match.index === k,
                )
              ) {
                correlation.match.push({
                  atomType: otherAtomType,
                  index: k,
                });
              }
            },
          ),
        );
      }),
    ),
  );
};

const setAttachments = (correlations, atomTypesInSpectra) => {
  // update attachment information between heavy atoms and protons via HSQC or HMQC
  const correlationsProtons = lodash.get(correlations, 'H', []);
  if (correlationsProtons.length > 0) {
    atomTypesInSpectra.forEach((atomType) => {
      const correlationsAtomType = correlations[atomType];
      if (atomType !== 'H') {
        for (let j = 0; j < correlationsAtomType.length; j++) {
          const indicesProtons = correlationsAtomType[j].correlation
            .filter(
              (correlation) =>
                correlation.experimentType === 'hsqc' ||
                correlation.experimentType === 'hmqc',
            )
            .map((correlation) => correlation.match.map((match) => match.index))
            .flat()
            .filter((index, i, a) => a.indexOf(index) === i);
          if (indicesProtons.length > 0) {
            attach(correlations, correlationsAtomType, j, 'H', indicesProtons);
          }
          indicesProtons.forEach((index) => {
            attach(correlations, correlationsProtons, index, atomType, [j]);
          });
        }
      }
    });
  }
};

export {
  attach,
  checkSignalMatch,
  getAtomType,
  getLabel,
  getLabelStyle,
  setAttachments,
  setCorrelations,
  setMatches,
};
