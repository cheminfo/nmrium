import { useTopicMolecule } from '../../context/TopicMoleculeContext.js';
import useSpectrum from '../../hooks/useSpectrum.js';

import { getCorrelationColor } from './utilities/getCorrelationColor.js';
import { getCouplingLength } from './utilities/getCouplingLength.js';

export function useClassifyCorrelation(xDiaIDs: string[], yDiaIDs: string[]) {
  const topicMolecules = useTopicMolecule();
  const spectrum = useSpectrum();
  let color = 'grey';

  const couplingLength = getCouplingLength(topicMolecules, xDiaIDs, yDiaIDs);
  const experiment = spectrum?.info.experiment;

  if (couplingLength !== null && experiment) {
    color = getCorrelationColor(experiment, couplingLength);
  }

  return { couplingLength, color };
}
