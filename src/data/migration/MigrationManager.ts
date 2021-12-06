import migrateToVersion1 from './migrateToVersion1';
import migrateToVersion2 from './migrateToVersion2';

export const CURRENT_EXPORT_VERSION = 2;

function migrationPipe(functions: ((data: any) => any)[]) {
  return (input: any) => functions.reduce((input, func) => func(input), input);
}

export function migrate(data: any): any {
  let migrationsFuncs: ((data: any) => any)[] = [
    migrateToVersion1,
    migrateToVersion2,
  ];
  let index = data?.version || 0;

  return migrationPipe(migrationsFuncs.slice(index))(data);
}
