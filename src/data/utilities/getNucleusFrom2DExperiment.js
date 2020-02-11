/**
 * Returns a list of likely nuclei based on an experiment string
 * This is really an hypothesis and should not be used
 * @param {string} experiment
 * @return {string[]}
 */

export function getNucleusFrom2DExperiment(experiment) {
  if (typeof experiment !== 'string') {
    return [];
  }
  experiment = experiment.toLowerCase();
  if (experiment.includes('jres')) {
    return ['1H', 'Hz'];
  }
  if (experiment.includes('hmbc') || experiment.includes('hsqc')) {
    return ['1H', '13C'];
  }
  if (experiment.includes('cosy') || experiment.includes('tocsy')) {
    return ['1H', '1H'];
  }
  return [];
}
