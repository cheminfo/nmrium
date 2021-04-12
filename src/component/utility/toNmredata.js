import jszip from 'jszip';
import { getGroupedDiastereotopicAtomIDs } from 'openchemlib-utils';
import { Molecule as OCLMolecule } from 'openchemlib/full';

import { get1DSignals } from './util/get1DSignals';
import { get2DSignals } from './util/get2DSignals';
import { getLabels } from './util/getLabels';

const tags = {
  solvent: 'SOLVENT',
  temperature: 'TEMPERATURE',
  assignment: 'ASSIGNMENT',
  j: 'J',
  signals: 'SIGNALS',
  id: 'ID',
};

export function toNmredata(state, options = {}) {
  const {
    data, // it would be changed depending of the final location
    molecules,
  } = state || {
    data: [], // it would be changed depending of the final location
    molecules: [],
  };

  const { id, prefix = '\n> <NMREDATA_', filename = 'nmredata' } = options;

  let sdfResult = '';
  let nmrRecord = new jszip();

  let molecule = OCLMolecule.fromMolfile(molecules[0].molfile);
  molecule.addImplicitHydrogens();
  let groupedDiaIDs = getGroupedDiastereotopicAtomIDs(molecule);

  let groupedOptions = {
    prefix,
    molecule,
    groupedDiaIDs,
    nmrRecord,
  };

  sdfResult += molecule.toMolfile();
  let labels = getLabels(data, groupedOptions);
  sdfResult += `${prefix}VERSION>\n1.1\\\n`;
  sdfResult += putTag(data, 'temperature', { prefix });
  sdfResult += putTag(data, 'solvent', { prefix });

  if (id) {
    sdfResult += `${prefix + tags.id}>\nid\\\n`;
  }

  sdfResult += formatAssignments(labels.byDiaID, groupedOptions);
  sdfResult += get1DSignals(data, labels, groupedOptions);
  sdfResult += get2DSignals(data, labels, groupedOptions);
  sdfResult += '\n$$$$\n';
  nmrRecord.file(`${filename}.sdf`, sdfResult);
  return nmrRecord;
}

function formatAssignments(labels, options) {
  const { prefix } = options;
  let str = `${prefix + tags.assignment}>\n`;
  for (let l in labels) {
    let atoms = labels[l].atoms;
    str += `${labels[l].label}, ${labels[l].shift}`; // change to add label
    for (let atom of atoms) str += `, ${atom}`;
    str += '\\\n';
  }
  return str;
}

function putTag(spectra, tag, options = {}) {
  const { prefix } = options;
  let str = '';
  for (let spectrum of spectra) {
    if (spectrum.info[tag]) {
      str += `${prefix + tags[tag]}>\n${String(spectrum.info[tag])}\\\n`;
      break;
    }
  }
  return str;
}
