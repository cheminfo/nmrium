/**
 * Returns an experiment string based on a pulse sequence
 * @param {string} pulse
 * @return {string}
 */
export function getSpectrumType(meta = {}, info = {}) {
  if (meta === null) meta = {};
  if (typeof meta === 'string') {
    meta = { pulse: meta };
  }
  console.log({ meta, info, test: info.$SPECTYP });
  let spectyp = (Array.isArray(info.$SPECTYP)
    ? info.$SPECTYP[0]
    : info.$SPECTYP || ''
  )
    .replace(/^<(.*)>$/, '$1')
    .toLowerCase();

  if (spectyp) return spectyp;

  let pulse = meta.pulse;
  if (typeof pulse !== 'string') {
    return '';
  }

  pulse = pulse.toLowerCase();
  if (pulse.includes('zg')) {
    return '1d';
  }

  if (
    pulse.includes('hsqct') ||
    (pulse.includes('invi') && (pulse.includes('ml') || pulse.includes('di')))
  ) {
    return 'hsqctocsy';
  }

  if (pulse.includes('hsqc') || pulse.includes('invi')) {
    return 'hsqc';
  }

  if (
    pulse.includes('hmbc') ||
    (pulse.includes('inv4') && pulse.includes('lp'))
  ) {
    return 'hmbc';
  }

  if (pulse.includes('cosy')) {
    return 'cosy';
  }

  if (pulse.includes('jres')) {
    return 'jres';
  }

  if (
    pulse.includes('tocsy') ||
    pulse.includes('mlev') ||
    pulse.includes('dipsi')
  ) {
    return 'tocsy';
  }

  if (pulse.includes('noesy')) {
    return 'noesy';
  }

  if (pulse.includes('roesy')) {
    return 'roesy';
  }

  if (pulse.includes('dept')) {
    return 'dept';
  }

  if (pulse.includes('jmod') || pulse.includes('apt')) {
    return 'aptjmod';
  }

  return '';
}
