import gsd from 'ml-gsd';

export default function peakPicking(data, options = {}) {
  const peaks = gsd(data.x, data.re, {
    noiseLevel: 0,
    minMaxRatio: 0.00025, // Threshold to determine if a given peak should be considered as a noise
    realTopDetection: true,
    maxCriteria: true, // inverted:false
    smoothY: false,
    sgOptions: { windowSize: 7, polynomial: 3 },
  });
  console.log(peaks);
  return peaks;
}
