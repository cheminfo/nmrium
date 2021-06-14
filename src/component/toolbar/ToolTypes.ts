import { Filters } from '../../data/Filters';

interface OptionItem {
  id: string;
  label: string;
  hasOptionPanel: boolean;
  isFilter: boolean;
}

type RecordOptions = Record<
  | 'zoom'
  | 'peakPicking'
  | 'integral'
  | 'zone2D'
  | 'slicingTool'
  | 'HMove'
  | 'equalizerTool'
  | 'rangesPicking'
  | 'zeroFilling'
  | 'phaseCorrection'
  | 'baseLineCorrection'
  | 'generalSelector'
  | 'editRange'
  | 'multipleSpectraAnalysis'
  | 'exclusionZones',
  OptionItem
>;

export const options: RecordOptions = {
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
  zone2D: {
    id: 'zone2D',
    label: 'Zone Tool',
    hasOptionPanel: true,
    isFilter: false,
  },
  slicingTool: {
    id: 'slicingTool',
    label: 'Slicing Tool',
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
  generalSelector: {
    id: 'generalSelector',
    label: 'range general selecttor',
    hasOptionPanel: false,
    isFilter: false,
  },

  editRange: {
    id: 'editRange',
    label: 'edit range',
    hasOptionPanel: false,
    isFilter: false,
  },

  multipleSpectraAnalysis: {
    id: 'multipleSpectraAnalysis',
    label: 'Multiple Spectra Analysis',
    hasOptionPanel: false,
    isFilter: false,
  },
  exclusionZones: {
    id: 'exclusionZones',
    label: 'Exclusion Zones',
    hasOptionPanel: false,
    isFilter: false,
  },
};
