import c13 from './13c.js';
import h1 from './1h.js';

const defaults = {
  '1h': h1,
  '13c': c13,
};

export function getPeakLabelNumberDecimals(nucleus) {
  return defaults[getNucleus(nucleus)].peakLabelNumberDecimals;
}

function getNucleus(nucleus = '1h') {
  nucleus = nucleus.toLowerCase();
  if (!defaults[nucleus]) {
    return '1h';
  }
  return nucleus;
}
