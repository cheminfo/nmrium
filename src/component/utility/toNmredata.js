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

export async function toNmredata(state, options = {}) {
  const {
    data, // it would be changed depending of the final location
    molecules,
  } = state || {
    data: [], // it would be changed depending of the final location
    molecules: [],
  };

  let nmrRecord = new jszip();

  for (const molecule of molecules) {
    await addNMReDATA(data, nmrRecord, {
      ...options,
      molecule,
    });
  }

  if (!molecules.length) await addNMReDATA(data, nmrRecord, options);
  return nmrRecord;
}

async function addNMReDATA(data, nmrRecord, options = {}) {
  let {
    id,
    prefix = '\n> <NMREDATA_',
    filename = 'nmredata',
    molecule,
  } = options;

  let sdfResult = '';

  let groupedDiaIDs;
  if (molecule) {
    molecule = OCLMolecule.fromMolfile(molecule.molfile);
    sdfResult += molecule.toMolfile();
    molecule.addImplicitHydrogens();
    groupedDiaIDs = getGroupedDiastereotopicAtomIDs(molecule);
  }

  let labels = molecule ? getLabels(data, { groupedDiaIDs, molecule }) : {};

  sdfResult += `${prefix}VERSION>\n1.1\\\n`;
  sdfResult += putTag(data, 'temperature', { prefix });
  sdfResult += putTag(data, 'solvent', { prefix });

  if (id) sdfResult += `${prefix + tags.id}>\nid\\\n`;
  sdfResult += formatAssignments(labels.byDiaID, { prefix });
  sdfResult += await get1DSignals(data, nmrRecord, { prefix, labels });
  sdfResult += await get2DSignals(data, nmrRecord, { prefix, labels });
  sdfResult += '\n$$$$\n';
  nmrRecord.file(`${filename}.sdf`, sdfResult);
}

function formatAssignments(labels, options) {
  if (!labels) return '';
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
