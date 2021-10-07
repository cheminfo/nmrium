import { protonImpurities, carbonImpurities } from 'nmr-processing';
import { DatabaseNMREntry } from 'nmr-processing/lib/databases/DatabaseNMREntry';
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

export interface DataBase {
  data: Record<
    string,
    {
      description: string;
      value: Array<DatabaseNMREntry>;
    }
  >;
}

export const database: DataBase = {
  data: {
    solvent: {
      description: 'Solvent database',
      value: [...protonImpurities, ...carbonImpurities],
    },
  },
};

export interface InitiateDatabaseResult {
  data: DatabaseNMREntry[];
  getSolvents: () => string[];
  search: (keywords?: string[]) => DatabaseNMREntry[];
}

export function initiateDatabase(
  databaseKey: string,
  nucleus: string,
): InitiateDatabaseResult {
  const databaseData = database.data[databaseKey]
    ? database.data[databaseKey].value
    : [];

  const data = filter(databaseData, {
    keywords: [nucleus],
  });

  const getSolvents = () => prepareGetSolvents(data);
  const search = (keywords: string[] = []) => prepareSearch(data, keywords);

  return { data, getSolvents, search };
}

function prepareSearch(data, keywords: string[]): Array<DatabaseNMREntry> {
  return filter(data, { keywords });
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

export function getDatabasesNames() {
  return Object.keys(database.data).map((key) => {
    const { description } = database.data[key];
    return { id: key, name: description };
  });
}
