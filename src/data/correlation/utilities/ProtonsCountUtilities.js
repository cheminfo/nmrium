import lodash from 'lodash';

import {
  checkSignalMatch,
  getCorrelationsByAtomType,
} from './GeneralUtilities';

const setProtonsCountFromData = (
  correlations,
  signalsDEPT,
  signals2D,
  tolerance,
) => {
  const heavyAtomTypes = [];
  correlations.forEach((correlation) => {
    if (
      correlation.getPseudo() === false &&
      correlation.getAtomType() !== 'H' &&
      !heavyAtomTypes.includes(correlation.getAtomType())
    ) {
      heavyAtomTypes.push(correlation.getAtomType());
      if (Object.keys(signalsDEPT).length > 0) {
        setProtonsCountFromDEPT(
          correlations,
          signalsDEPT,
          tolerance,
          correlation.getAtomType(),
        );
      } else {
        setProtonsCountFromEditedHSQC(
          correlations,
          signals2D,
          tolerance,
          correlation.getAtomType(),
        );
      }
    }
  });
};

const setProtonsCountFromDEPT = (
  correlations,
  signalsDEPT,
  tolerance,
  atomType,
) => {
  const correlationsAtomType = getCorrelationsByAtomType(
    correlations,
    atomType,
  ).filter((correlation) => correlation.getPseudo() === false);
  const signalsDEPT90 = lodash
    .get(signalsDEPT, '90', [])
    .filter((signalDEPT90) => signalDEPT90.atomType === atomType)
    .map((signalDEPT90) => signalDEPT90.signal);
  const signalsDEPT135 = lodash
    .get(signalsDEPT, '135', [])
    .filter((signalDEPT135) => signalDEPT135.atomType === atomType)
    .map((signalDEPT135) => signalDEPT135.signal);

  setProtonsCount(
    correlationsAtomType,
    signalsDEPT90,
    signalsDEPT135,
    tolerance[atomType],
  );
};

const setProtonsCountFromEditedHSQC = (
  correlations,
  signals2D,
  tolerance,
  heavyAtomType,
) => {
  const correlationsAtomTypeHSQC = correlations.filter(
    (correlation) =>
      correlation.getPseudo() === false &&
      correlation.getAtomType() === heavyAtomType,
  );
  const signalsEditedHSQC = lodash
    .get(signals2D, 'hsqc', [])
    .filter(
      (signal2D) =>
        signal2D.atomType[1] === heavyAtomType && signal2D.signal.sign !== 0,
    )
    .map((signal2D) => {
      return { delta: signal2D.signal.y.delta, sign: signal2D.signal.sign };
    });

  setProtonsCount(
    correlationsAtomTypeHSQC,
    [],
    signalsEditedHSQC,
    tolerance[heavyAtomType],
  );
};

const setProtonsCount = (
  correlationsAtomType,
  signals90,
  signals135,
  toleranceAtomType,
) => {
  for (let i = 0; i < correlationsAtomType.length; i++) {
    if (correlationsAtomType[i].getEdited().protonsCount) {
      // do not overwrite a manually edited value
      continue;
    }

    const match = [-1, -1];
    for (let k = 0; k < signals90.length; k++) {
      if (
        signals90[k].sign === 1 &&
        checkSignalMatch(
          correlationsAtomType[i].signal,
          signals90[k],
          toleranceAtomType,
        )
      ) {
        match[0] = k;
        break;
      }
    }
    for (let k = 0; k < signals135.length; k++) {
      if (
        checkSignalMatch(
          correlationsAtomType[i].signal,
          signals135[k],
          toleranceAtomType,
        )
      ) {
        match[1] = k;
        break;
      }
    }

    if (match[0] >= 0) {
      // signal match in DEPT90
      // CH
      correlationsAtomType[i].setProtonsCount([1]);
      continue;
    }
    // no signal match in DEPT90
    if (match[1] >= 0) {
      // signal match in DEPT135
      if (signals135[match[1]].sign === 1) {
        // positive signal
        if (signals90.length > 0) {
          // in case of both DEPT90 and DEPT135 are given
          // CH3
          correlationsAtomType[i].setProtonsCount([3]);
          if (!correlationsAtomType[i].getEdited().hybridization) {
            // do not overwrite a manually edited value
            correlationsAtomType[i].setHybridization('SP3');
          }
        } else {
          // in case of DEPT135 is given only
          // CH or CH3
          correlationsAtomType[i].setProtonsCount([1, 3]);
        }
      } else {
        // negative signal
        // CH2
        correlationsAtomType[i].setProtonsCount([2]);
      }
    } else {
      if (signals135.length > 0) {
        // no signal match in both spectra
        // qC
        correlationsAtomType[i].setProtonsCount([0]);
      } else {
        // no information
        correlationsAtomType[i].setProtonsCount([]);
      }
    }
  }
};

export {
  setProtonsCount,
  setProtonsCountFromData,
  setProtonsCountFromDEPT,
  setProtonsCountFromEditedHSQC,
};
