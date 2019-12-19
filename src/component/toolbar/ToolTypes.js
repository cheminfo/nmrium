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
    label: 'Peak Tool',
    hasOptionPanel: true,
    isFilter: false,
  },
  integral: {
    id: 'integral',
    label: 'integral Tool',
    hasOptionPanel: false,
    isFilter: false,
  },
  HMove: {
    id: 'HMove',
    label: 'move spectrum horizontal',
    hasOptionPanel: false,
    isFilter: false,
  },
  equalizerTool: {
    id: 'equalizerTool',
    label: 'Equalizer Tool',
    hasOptionPanel: false,
    isFilter: false,
  },
  // autoPeaksPicking: {
  //   id: 'autoPeaksPicking',
  //   label: 'Auto Peaks Picking',
  //   hasOptionPanel: true,
  //   isFilter: false,
  // },
  autoRangesPicking: {
    id: 'autoRangesPicking',
    label: 'Auto Ranges Picking',
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
    label: Filters.phaseCorrection.name,
    hasOptionPanel: true,
    isFilter: true,
  },
};
