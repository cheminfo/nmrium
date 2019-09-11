const defaults = {
  '1h': require('./1h.json'),
  '13c': require('./13c.json'),
};

export function getPeakLabelNumberDecimals(nucleus) {
  return defaults[getNucleus(nucleus)].peakLabelNumberDecimals;
}

function getNucleus(nucleus = '1h') {
  nucleus = nucleus.toLowerCase();
  if (!defaults[nucleus]) {
    throw new Error(`No defaults preferences for nucleus: ${nucleus}`);
  }
  return nucleus;
}
