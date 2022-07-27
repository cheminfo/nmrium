import migrateToVersion1 from './migrateToVersion1';
import migrateToVersion2 from './migrateToVersion2';
import migrateToVersion3 from './migrateToVersion3';

export const CURRENT_EXPORT_VERSION = 3;

function migrationPipe(functions: ((data: any) => any)[]) {
  return (input: any) => functions.reduce((input, func) => func(input), input);
}

export function migrate(data: any): any {
  let migrationsFuncs: ((data: any) => any)[] = [
    migrateToVersion1,
    migrateToVersion2,
    migrateToVersion3,
  ];
  let index = data?.version || 0;

  if (index > CURRENT_EXPORT_VERSION) {
    throw new Error(
      'This file can not be imported using the current NMRium version, Please move to the new one !!! ',
    );
  }

  return migrationPipe(migrationsFuncs.slice(index))(data);
}
