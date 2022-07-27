import * as Filters from '../../data/Filters';

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
  | 'apodization'
  | 'zeroFilling'
  | 'phaseCorrection'
  | 'baselineCorrection'
  | 'generalSelector'
  | 'editRange'
  | 'multipleSpectraAnalysis'
  | 'exclusionZones'
  | 'databaseRangesSelection',
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
    label: 'Ranges Picking',
    hasOptionPanel: true,
    isFilter: false,
  },
  apodization: {
    id: Filters.apodization.id,
    label: Filters.apodization.name,
    hasOptionPanel: true,
    isFilter: true,
  },
  zeroFilling: {
    id: Filters.zeroFilling.id,
    label: Filters.zeroFilling.name,
    hasOptionPanel: true,
    isFilter: true,
  },
  phaseCorrection: {
    id: Filters.phaseCorrection.id,
    label: Filters.phaseCorrection.name,
    hasOptionPanel: true,
    isFilter: true,
  },
  baselineCorrection: {
    id: Filters.baselineCorrection.id,
    label: Filters.baselineCorrection.name,
    hasOptionPanel: true,
    isFilter: true,
  },
  generalSelector: {
    id: 'generalSelector',
    label: 'range general selector',
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
  databaseRangesSelection: {
    id: 'databaseRangesSelection',
    label: 'Filter Database',
    hasOptionPanel: false,
    isFilter: false,
  },
};
