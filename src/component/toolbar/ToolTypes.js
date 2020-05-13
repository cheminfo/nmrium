import { Filters } from '../../data/data1d/filter1d/Filters';

export const options = {
  zoom: {
    id: 'zoom',
    label: 'Zoom',
    hasOptionPanel: false,
    isFilter: false,
  },
  peakPicking: {
    id: 'peakPicking',
    label: 'Peaks Picking',
    hasOptionPanel: true,
    isFilter: false,
  },
  integral: {
    id: 'integral',
    label: 'integral Tool',
    hasOptionPanel: false,
    isFilter: false,
  },
  integral2D: {
    id: 'integral2D',
    label: 'integral Tool',
    hasOptionPanel: false,
    isFilter: false,
  },
  projection: {
    id: 'projection',
    label: 'projection Tool',
    hasOptionPanel: false,
    isFilter: false,
  },
  HMove: {
    id: 'HMove',
    label: 'Move spectrum horizontally',
    hasOptionPanel: false,
    isFilter: false,
  },
  equalizerTool: {
    id: 'equalizerTool',
    label: 'Equalizer Tool',
    hasOptionPanel: false,
    isFilter: false,
  },
  rangesPicking: {
    id: 'rangesPicking',
    label: 'Ranges Picking ( Press r )',
    hasOptionPanel: true,
    isFilter: false,
  },
  zeroFilling: {
    id: Filters.zeroFilling.id,
    label: Filters.zeroFilling.name,
    hasOptionPanel: true,
    isFilter: true,
  },
  phaseCorrection: {
    id: Filters.phaseCorrection.id,
    label: `${Filters.phaseCorrection.name} ( Press a )`,
    hasOptionPanel: true,
    isFilter: true,
  },
  baseLineCorrection: {
    id: 'baseLineCorrection',
    label: 'baseline correction ( Press b )',
    hasOptionPanel: true,
    isFilter: true,
  },
};
