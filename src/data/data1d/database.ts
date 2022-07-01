import {
  protonImpurities,
  carbonImpurities,
  Jcoupling,
  DatabaseNMREntry,
} from 'nmr-processing';
import { MoleculesDB } from 'openchemlib-utils';
import OCL from 'openchemlib/full';
import { filter } from 'smart-array-filter';

import generateID from '../utilities/generateID';

export interface DataBaseSignal {
  assignment: string;
  delta: number;
}

export interface DataBaseRange {
  from: number;
  to: number;
  signals: Array<DataBaseSignal>;
}

export type DataBase = {
  label: string;
  url?: string;
  value?: Array<DatabaseNMREntry>;
}[];

export const databases: DataBase = [
  {
    label: 'Solvent database',
    value: prepareDataBase([...protonImpurities, ...carbonImpurities]),
  },
];

export interface InitiateDatabaseResult {
  data: DatabaseNMREntry[];
  getSolvents: () => string[];
  search: (keywords?: string | string[]) => DatabaseNMREntry[];
  searchByStructure: (molfile: string) => DatabaseNMREntry[];
}

export function initiateDatabase(
  databases: DatabaseNMREntry[],
  nucleus: string,
): InitiateDatabaseResult {
  const data = databases.filter((datum) => datum.nucleus === nucleus);
  const moleculesDB = prepareMoleculesDB(data);

  const getSolvents = () => prepareGetSolvents(data);
  const search = (keywords: string | string[] = []) =>
    filter(data, { keywords });
  const searchByStructure = (molfile: string) =>
    prepareSearchByStructure(moleculesDB, molfile);

  return { searchByStructure, data, getSolvents, search };
}

function prepareSearchByStructure(
  moleculesDB: MoleculesDB,
  molFile: string,
): DatabaseNMREntry[] {
  const molecule = OCL.Molecule.fromMolfile(molFile);
  const result = moleculesDB.search(molecule) || [];
  return result.map((entry) => entry.data, []);
}

function prepareGetSolvents(data) {
  const result: string[] = [];
  const map = new Map();
  for (const item of data) {
    if (!map.has(item.solvent)) {
      map.set(item.solvent, true);
      result.push(item.solvent);
    }
  }
  return result;
}

// export function getDatabasesNames() {
//   return databases.map((database, index) => {
//     const { label } = database;
//     return { id: index, name: label };
//   });
// }

function prepareMoleculesDB(array: Array<DatabaseNMREntry>) {
  let moleculesDB = new MoleculesDB(OCL);
  for (let entry of array) {
    if (entry.smiles) {
      const molecule = OCL.Molecule.fromSmiles(entry.smiles);
      moleculesDB.pushEntry(molecule, entry);
    }
  }
  return moleculesDB;
}

function prepareDataBase(array: Array<DatabaseNMREntry>) {
  return array.map((item) => {
    item.ranges = item.ranges.map((range) => ({
      id: generateID(),
      ...range,
    }));
    return item;
  }, []);
}

export type PrepareDataResult = Partial<
  DataBaseRange | DataBaseSignal | Jcoupling
>;

export function prepareData(
  data: Array<DatabaseNMREntry>,
): PrepareDataResult[] {
  const result: PrepareDataResult[] = [];
  let index = 0;
  for (const item of data) {
    let ids: string[] = [];
    const { ranges = [], ...restItemKeys } = item;

    for (const range of ranges) {
      ids.push(range.id || generateID());
      const { signals = [], ...restRangKeys } = range;
      for (const signal of signals) {
        const { js = [], ...restSignalKeys } = signal;
        const jsResult = mapJs(js);

        const data = {
          ...restItemKeys,
          ...restRangKeys,
          ...restSignalKeys,
          ...jsResult,
          index,
          id: ids,
          ranges,
        };
        result.push(data);
      }
    }
    index++;
  }
  return result;
}

function mapJs(js: Jcoupling[]) {
  if (js && js.length > 0) {
    const { coupling, multiplicity } = js.reduce<any>(
      (acc, { coupling, multiplicity }) => {
        acc.coupling.push(coupling.toFixed(1));
        acc.multiplicity += multiplicity;
        return acc;
      },
      { coupling: [], multiplicity: '' },
    );
    return { multiplicity, coupling: coupling.join(',') };
  } else {
    return { multiplicity: 's', coupling: '' };
  }
}
