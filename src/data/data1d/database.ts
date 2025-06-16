import type { DatabaseNMREntry, Jcoupling } from 'nmr-processing';
import { carbonImpurities, protonImpurities } from 'nmr-processing';
import * as OCL from 'openchemlib';
import { MoleculesDB } from 'openchemlib-utils';
import { filter } from 'smart-array-filter';

interface DataBaseSignal {
  assignment: string;
  delta: number;
}

interface DataBaseBasic {
  spectrumID: string;
  index: number;
  names: string[];
  solvent: string;
  smiles: string;
  ocl: {
    idCode: string;
    coordinates: string;
  };
}
interface DataBaseRange {
  from: number;
  to: number;
  signals: DataBaseSignal[];
}

export interface LocalDatabase {
  key: string;
  label: string;
  url?: string;
  value?: DatabaseNMREntry[];
}

export const DATA_BASES: LocalDatabase[] = [
  {
    key: 'local_solvent',
    label: 'Solvent database',
    value: prepareDataBase([...protonImpurities, ...carbonImpurities]),
  },
];

interface Coupling {
  multiplicity: string;
  coupling: string;
}

export type PrepareDataResult = Partial<
  DataBaseBasic & DataBaseRange & DataBaseSignal & Coupling
>;

export interface InitiateDatabaseResult {
  data: DatabaseNMREntry[];
  getSolvents: () => string[];
  search: (options: {
    keywords?: string | string[];
    idCode?: string;
  }) => DatabaseNMREntry[];
}

export function initiateDatabase(
  databases: DatabaseNMREntry[],
  nucleus: string,
): InitiateDatabaseResult {
  const data = databases.filter((datum) => datum.nucleus === nucleus);
  const moleculesDB = prepareMoleculesDB(data);

  const getSolvents = () => prepareGetSolvents(data);
  const search: InitiateDatabaseResult['search'] = ({
    idCode = '',
    keywords = '',
  }) => prepareSearch({ idCode, keywords, data, moleculesDB });

  return { data, getSolvents, search };
}

function prepareSearch(options: {
  data: DatabaseNMREntry[];
  keywords: string | string[];
  moleculesDB: MoleculesDB;
  idCode?: string;
}) {
  const { data, keywords = [], moleculesDB, idCode } = options;
  let searchData = data;
  if (idCode) {
    searchData = processSearchByStructure(moleculesDB, idCode);
  }

  return filter(searchData, { keywords });
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

function prepareMoleculesDB(array: DatabaseNMREntry[]) {
  const moleculesDB = new MoleculesDB(OCL);
  for (const entry of array) {
    if (entry.ocl) {
      try {
        const molecule = OCL.Molecule.fromIDCode(
          entry.ocl.idCode,
          entry.ocl.coordinates,
        );
        moleculesDB.pushEntry(molecule, entry, {
          idCode: entry.ocl.idCode,
          index: entry.ocl.index,
        });
      } catch {
        // eslint-disable-next-line no-console
        console.error(`Could not parse idCode: ${JSON.stringify(entry.ocl)}`);
      }
    } else if (entry.smiles) {
      try {
        const molecule = OCL.Molecule.fromSmiles(entry.smiles);
        moleculesDB.pushEntry(molecule, entry);
      } catch {
        // eslint-disable-next-line no-console
        console.error(`Could not parse SMILES: ${entry.smiles}`);
      }
    }
  }
  return moleculesDB;
}

function prepareDataBase(array: DatabaseNMREntry[]) {
  return array.map((item) => {
    item.ranges = item.ranges.map((range) => ({
      id: crypto.randomUUID(),
      ...range,
    }));
    return item;
  });
}

export function prepareData(data: DatabaseNMREntry[]): PrepareDataResult[] {
  const result: PrepareDataResult[] = [];
  let index = 0;
  for (const item of data) {
    const ids: string[] = [];
    const { ranges, id: spectrumID, ...restItemKeys } = item;
    if (!ranges) {
      ids.push(spectrumID);
      result.push({
        ...restItemKeys,
        index,
        id: ids,
        spectrumID,
        ranges: [],
      } as PrepareDataResult);
    } else {
      for (const range of ranges) {
        ids.push(range.id || crypto.randomUUID());
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
            spectrumID,
          };
          result.push(data as unknown as PrepareDataResult);
        }
      }
    }
    index++;
  }
  return result;
}

function mapJs(js: Jcoupling[]) {
  if (js && js.length > 0) {
    const result: { coupling: number[]; multiplicity: string } = {
      coupling: [],
      multiplicity: '',
    };
    for (const { coupling, multiplicity } of js) {
      result.coupling.push(coupling);
      result.multiplicity += multiplicity || '';
    }
    const { coupling, multiplicity } = result;
    if (multiplicity.length === 0) return { coupling: coupling.join(',') };
    return { multiplicity, coupling: coupling.join(',') };
  } else {
    return { coupling: '' };
  }
}
