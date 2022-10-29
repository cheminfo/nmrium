import { v4 } from '@lukeed/uuid';
import {
  protonImpurities,
  carbonImpurities,
  Jcoupling,
  DatabaseNMREntry,
} from 'nmr-processing';
import { MoleculesDB } from 'openchemlib-utils';
import OCL from 'openchemlib/full';
import { filter } from 'smart-array-filter';

export interface DataBaseSignal {
  assignment: string;
  delta: number;
}

export interface DataBaseRange {
  from: number;
  to: number;
  signals: Array<DataBaseSignal>;
}

export type LocalDatabase = {
  key: string;
  label: string;
  url?: string;
  value?: Array<DatabaseNMREntry>;
};

export const DATA_BASES: LocalDatabase[] = [
  {
    key: 'local_solvent',
    label: 'Solvent database',
    value: prepareDataBase([...protonImpurities, ...carbonImpurities]),
  },
];

export interface InitiateDatabaseResult {
  data: DatabaseNMREntry[];
  getSolvents: () => string[];
  search: (keywords?: string | string[]) => DatabaseNMREntry[];
  searchByStructure: (idCode: string) => DatabaseNMREntry[];
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
  const searchByStructure = (idCode: string) =>
    processSearchByStructure(moleculesDB, idCode);

  return { searchByStructure, data, getSolvents, search };
}

function processSearchByStructure(
  moleculesDB: MoleculesDB,
  idCode: string,
): DatabaseNMREntry[] {
  // default format { format: 'idCode' }
  // https://github.com/cheminfo/openchemlib-utils/blob/ef3a9c30be7efe225a24de04ea9cefc9299674aa/src/db/MoleculesDB.js#L102-L115

  // todo: idCode may be null and the current version of search requires a string or molecule. `|| ''` will become useless in next release of openchemlib-util
  const result = moleculesDB.search(idCode || '');
  return result.map((entry) => entry.data);
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
    if (entry.ocl) {
      try {
        const molecule = OCL.Molecule.fromIDCode(
          entry.ocl.idCode,
          entry.ocl.coordinates,
        );
        moleculesDB.pushEntry(
          molecule,
          entry,
          {},
          {
            idCode: entry.ocl.idCode,
            index: entry.ocl.index,
          },
        );
      } catch (error) {
        reportError(error);
        // eslint-disable-next-line no-console
        console.error(`Could not parse idCode: ${JSON.stringify(entry.ocl)}`);
      }
    } else if (entry.smiles) {
      try {
        const molecule = OCL.Molecule.fromSmiles(entry.smiles);
        moleculesDB.pushEntry(molecule, entry);
      } catch (error) {
        reportError(error);
        // eslint-disable-next-line no-console
        console.error(`Could not parse smiles: ${entry.smiles}`);
      }
    }
  }
  return moleculesDB;
}

function prepareDataBase(array: Array<DatabaseNMREntry>) {
  return array.map((item) => {
    item.ranges = item.ranges.map((range) => ({
      id: v4(),
      ...range,
    }));
    return item;
  });
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
      ids.push(range.id || v4());
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
    const result: { coupling: Array<number>; multiplicity: string } = {
      coupling: [],
      multiplicity: '',
    };
    for (const { coupling, multiplicity } of js) {
      result.coupling.push(coupling);
      result.multiplicity += multiplicity;
    }
    const { coupling, multiplicity } = result;
    return { multiplicity, coupling: coupling.join(',') };
  } else {
    return { multiplicity: '', coupling: '' };
  }
}
