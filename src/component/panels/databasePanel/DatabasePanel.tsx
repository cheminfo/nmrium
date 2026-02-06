import type {
  Database,
  NMRiumCore,
  NmriumState,
  Spectrum1D,
} from '@zakodium/nmrium-core';
import type { DatabaseNMREntry } from 'nmr-processing';
import { mapRanges } from 'nmr-processing';
import { Molecule } from 'openchemlib';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOnOff } from 'react-science/ui';

import { getSum } from '../../../data/data1d/Spectrum1D/SumManager.js';
import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/index.js';
import type {
  InitiateDatabaseResult,
  LocalDatabase,
} from '../../../data/data1d/database.js';
import {
  DATA_BASES,
  initiateDatabase,
  prepareData,
} from '../../../data/data1d/database.js';
import { useChartData } from '../../context/ChartContext.js';
import { useCore } from '../../context/CoreContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import { EmptyText } from '../../elements/EmptyText.js';
import { useFormatNumberByNucleus } from '../../hooks/useFormatNumberByNucleus.js';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus.js';
import { options } from '../../toolbar/ToolTypes.js';
import Events from '../../utility/Events.js';
import { exportAsJsonBlob } from '../../utility/export.js';
import nucleusToString from '../../utility/nucleusToString.js';
import { saveAs } from '../../utility/save_as.js';
import { PanelNoData } from '../PanelNoData.js';
import { TablePanel } from '../extra/BasicPanelStyle.js';
import type { SettingsRef } from '../extra/utilities/settingImperativeHandle.js';
import PreferencesHeader from '../header/PreferencesHeader.js';

import DatabasePreferences from './DatabasePreferences.js';
import { DatabaseSearchOptions } from './DatabaseSearchOptions.js';
import { DatabaseStructureSearchModal } from './DatabaseStructureSearchModal.js';
import DatabaseTable from './DatabaseTable.js';

export type Databases = Array<LocalDatabase | Database>;

function getMolfile(options: {
  ocl?: { idCode?: string; coordinates?: string };
  smiles?: string;
}) {
  const { ocl, smiles } = options;

  if (ocl?.idCode && ocl?.coordinates) {
    const { idCode, coordinates } = ocl;
    return Molecule.fromIDCode(idCode, coordinates).toMolfileV3();
  }

  if (smiles) {
    return Molecule.fromSmiles(smiles).toMolfileV3();
  }

  return undefined;
}

interface DatabaseInnerProps {
  nucleus: string;
  selectedTool: string;
  databases: Databases;
  defaultDatabase: string;
}

export interface DatabaseSearchKeywords {
  solvent: string;
  searchKeywords: string;
}

export interface DataBaseSearchResultEntry {
  data: DatabaseNMREntry[];
  databases: Array<{ key: string; value: string }>;
  solvents: Array<{ label: string; value: string }>;
}

const emptyKeywords = {
  solvent: '-1',
  searchKeywords: '',
};

function mapKeywordsToArray(searchKeywords: string, solvent: string) {
  const values = searchKeywords
    ? searchKeywords
        .trim()
        .split(' ')
        .filter((value) => value !== '')
    : [];
  if (solvent !== '-1') {
    values.unshift(`solvent:${solvent}`);
  }
  return values;
}

function DatabasePanelInner({
  nucleus,
  selectedTool,
  databases,
  defaultDatabase,
}: DatabaseInnerProps) {
  const dispatch = useDispatch();
  const toaster = useToaster();

  const format = useFormatNumberByNucleus(nucleus);
  const [isFlipped, setFlipStatus] = useState(false);
  const [
    isOpenSearchByStructure,
    openSearchByStructure,
    closeSearchByStructure,
  ] = useOnOff(false);
  const settingRef = useRef<SettingsRef | null>(null);
  const [keywords, setKeywords] =
    useState<DatabaseSearchKeywords>(emptyKeywords);
  const databaseInstance = useRef<InitiateDatabaseResult | null>(null);
  const databaseDataRef = useRef<DatabaseNMREntry[]>([]);
  const [result, setResult] = useState<DataBaseSearchResultEntry>({
    data: [],
    databases: [],
    solvents: [],
  });
  const [idCode, setIdCode] = useState<string>();

  function settingsPanelHandler() {
    setFlipStatus((flag) => !flag);
  }

  async function saveSettingHandler() {
    const isSettingValid = await settingRef.current?.saveSetting();
    if (isSettingValid) {
      setFlipStatus(false);
    }
  }

  const search = useCallback(
    (solvents?: any[]) => {
      const { solvent, searchKeywords } = keywords;
      if (databaseInstance.current) {
        const keywords = mapKeywordsToArray(searchKeywords, solvent);
        const data = databaseInstance.current.search({ keywords, idCode });
        setResult((prevResult) => ({
          ...prevResult,
          data,
          ...(solvents && { solvents }),
        }));
      }
    },
    [idCode, keywords],
  );

  useEffect(() => {
    if (!databaseInstance.current) return;

    const { solvent, searchKeywords } = keywords;
    const runner = async () => {
      if (databaseInstance.current) {
        const hideLoading = await toaster.showAsyncLoading({
          message: 'Preparing of the Result',
        });
        if (solvent === '-1' && !searchKeywords) {
          const solvents = mapSolventsToSelect(
            databaseInstance.current.getSolvents(),
          );
          search(solvents);
        } else {
          search();
        }
        hideLoading();
      }
    };

    void runner();
  }, [idCode, keywords, search, toaster]);

  useEffect(() => {
    function handle(event: any) {
      if (selectedTool === options.databaseRangesSelection.id) {
        setKeywords((prevState) => {
          const oldKeywords = prevState.searchKeywords
            ? prevState.searchKeywords.split(' ')
            : [];
          const [from, to] = event.range;
          const searchKeywords = [
            ...oldKeywords,
            `delta:${format(from)}..${format(to)}`,
          ].join(' ');
          return { ...prevState, searchKeywords };
        });
      }
    }

    Events.on('brushEnd', handle);

    return () => {
      Events.off('brushEnd', handle);
    };
  }, [format, selectedTool]);

  useEffect(() => {
    if (!databaseInstance.current) return;

    const runner = async () => {
      const hideLoading = await toaster.showAsyncLoading({
        message: 'Loading the database',
      });

      databaseInstance.current = initiateDatabase(
        databaseDataRef.current,
        nucleus,
      );
      hideLoading();
      setKeywords({ ...emptyKeywords });
    };

    void runner();
  }, [nucleus, toaster]);

  const handleChangeDatabase = useCallback(
    (databaseKey: any) => {
      const database = databases.find((item) => item.key === databaseKey);

      setTimeout(async () => {
        if (database?.url) {
          const { url, label } = database;

          const hideLoading = await toaster.showAsyncLoading({
            message: `load ${label} database`,
          });

          try {
            databaseDataRef.current = await fetch(url)
              .then((response) => response.json())
              .then((databaseRecords: any) =>
                databaseRecords.map((record: any) => ({
                  ...record,
                  baseURL: url,
                })),
              );
          } catch {
            toaster.show({
              message: `Failed to load ${url}`,
              intent: 'danger',
            });
          } finally {
            hideLoading();
          }
        } else {
          databaseDataRef.current = (database as LocalDatabase)
            ?.value as DatabaseNMREntry[];
        }

        const hideLoading = await toaster.showAsyncLoading({
          message: 'Loading the database',
        });

        databaseInstance.current = initiateDatabase(
          databaseDataRef.current,
          nucleus,
        );

        setKeywords({ ...emptyKeywords });

        hideLoading();
      }, 0);
    },
    [databases, nucleus, toaster],
  );

  useEffect(() => {
    if (defaultDatabase && !databaseInstance.current) {
      handleChangeDatabase(defaultDatabase);
    }
  }, [databases, defaultDatabase, handleChangeDatabase, nucleus]);

  const tableData = useMemo(() => {
    return prepareData(result.data);
  }, [result.data]);

  const core = useCore();
  const resurrectHandler = useCallback(
    (rowData: any) => {
      const {
        index,
        baseURL,
        jcampURL: jcampRelativeURL,
        ocl,
        smiles,
      } = rowData;
      const molfile = getMolfile({ ocl, smiles });
      const databaseEntry = result.data[index];

      if (jcampRelativeURL) {
        const url = new URL(jcampRelativeURL, baseURL);
        setTimeout(async () => {
          const hideLoading = toaster.showLoading({
            message: `load jcamp in progress...`,
          });

          try {
            const [{ data }] = await core.readFromWebSource({
              entries: [{ baseURL: url.origin, relativePath: url.pathname }],
            });
            const spectrum = data?.spectra?.[0] || null;
            if (spectrum && isSpectrum1D(spectrum)) {
              dispatch({
                type: 'RESURRECTING_SPECTRUM',
                payload: { source: 'jcamp', databaseEntry, spectrum, molfile },
              });
            }
          } catch {
            toaster.show({ message: 'Failed to load Jcamp', intent: 'danger' });
          } finally {
            hideLoading();
          }
        }, 0);
      } else {
        dispatch({
          type: 'RESURRECTING_SPECTRUM',
          payload: { source: 'rangesOrSignals', databaseEntry, molfile },
        });
      }
    },
    [core, dispatch, result.data, toaster],
  );
  const saveHandler = useCallback(
    (row: any) => {
      if (row?.jcampURL) {
        setTimeout(async () => {
          const hideLoading = toaster.showLoading({
            message: `Download jcamp in progress...`,
          });

          try {
            await saveJcampAsJson(core, row, result);
            hideLoading();
          } catch {
            toaster.show({
              message: 'Failed to download the jcamp',
              intent: 'danger',
            });
          } finally {
            hideLoading();
          }
        }, 0);
      } else {
        toaster.show({ message: 'No jcamp file to save', intent: 'danger' });
      }
    },
    [core, result, toaster],
  );
  const removeHandler = useCallback(
    (row: any) => {
      const { spectrumID: id } = row;
      if (!id) {
        return;
      }

      dispatch({
        type: 'DELETE_SPECTRA',
        payload: {
          ids: [id],
          domainOptions: { isYDomainShared: false, updateYDomain: false },
        },
      });
      dispatch({
        type: 'DELETE_MOLECULE',
        payload: {
          id,
        },
      });
    },
    [dispatch],
  );

  const spectra = useSpectraByActiveNucleus();
  const removeAllHandler = useCallback(() => {
    const addedSpectraIDs: string[] = [];
    const dataBaseSpectraIds = new Set(
      databaseInstance.current?.data.map((databaseEntry) => databaseEntry.id),
    );

    for (const spectrum of spectra) {
      if (dataBaseSpectraIds.has(spectrum.id)) {
        addedSpectraIDs.push(spectrum.id);
      }
    }

    dispatch({
      type: 'DELETE_SPECTRA',
      payload: {
        ids: addedSpectraIDs,
        domainOptions: { isYDomainShared: false, updateYDomain: false },
      },
    });
  }, [dispatch, spectra]);
  const searchByStructureHandler = (idCodeValue: string) => {
    const molecule = Molecule.fromIDCode(idCodeValue);
    const atoms = molecule.getAllAtoms();
    setIdCode(atoms > 0 ? idCodeValue : '');
  };

  return (
    <TablePanel isFlipped={isFlipped}>
      {!isFlipped && (
        <>
          <DatabaseSearchOptions
            databases={databases}
            defaultDatabase={defaultDatabase}
            idCode={idCode}
            keywords={keywords}
            result={result}
            total={databaseInstance.current?.data.length || 0}
            onKeywordsChange={(options) =>
              setKeywords((prevKeywords) => ({ ...prevKeywords, ...options }))
            }
            onSettingClick={settingsPanelHandler}
            onStructureClick={openSearchByStructure}
            onDatabaseChange={handleChangeDatabase}
            onRemoveAll={removeAllHandler}
          />
          {isOpenSearchByStructure && (
            <DatabaseStructureSearchModal
              onClose={closeSearchByStructure}
              onChange={searchByStructureHandler}
              initialIdCode={idCode}
            />
          )}
        </>
      )}
      {isFlipped && (
        <PreferencesHeader
          onSave={saveSettingHandler}
          onClose={settingsPanelHandler}
        />
      )}
      <div className="inner-container">
        {!isFlipped ? (
          tableData && tableData.length > 0 ? (
            <DatabaseTable
              data={tableData}
              totalCount={result.data.length}
              onAdd={resurrectHandler}
              onRemove={removeHandler}
              onSave={saveHandler}
            />
          ) : (
            <EmptyText
              text={
                databases && databases?.length > 0
                  ? 'Please select a database'
                  : 'Please add databases URL in the general preferences'
              }
            />
          )
        ) : (
          <DatabasePreferences ref={settingRef} />
        )}
      </div>
    </TablePanel>
  );
}

const MemoizedDatabasePanel = memo(DatabasePanelInner);

export default function PeaksPanel() {
  const {
    view: {
      spectra: { activeTab },
    },
    toolOptions: { selectedTool },
    displayerMode,
  } = useChartData();
  const { current } = usePreferences();
  const { data, defaultDatabase } = current.databases;
  const databases = DATA_BASES.concat(
    data.filter((datum) => datum.enabled),
  ) as Databases;

  if (!activeTab || displayerMode !== '1D') {
    return (
      <PanelNoData>
        Databases are only available when 1D experimental spectrum is displayed.
        It will automatically select the corresponding nucleus
      </PanelNoData>
    );
  }
  return (
    <MemoizedDatabasePanel
      nucleus={activeTab}
      selectedTool={selectedTool}
      databases={databases}
      defaultDatabase={defaultDatabase}
    />
  );
}

function mapSolventsToSelect(solvents: string[]) {
  const result = solvents.map((key) => {
    return {
      label: key,
      value: key,
    };
  });
  result.unshift({ label: 'All', value: '-1' });
  return result;
}

async function saveJcampAsJson(
  core: NMRiumCore,
  rowData: any,
  filteredData: any,
) {
  const { index, baseURL, jcampURL, names, ocl = {}, smiles } = rowData;
  const { ranges } = filteredData.data[index];
  const url = new URL(jcampURL, baseURL);
  const [
    { data: { spectra, sources } = { sources: [], spectra: [] }, version },
  ] = await core.readFromWebSource({
    entries: [{ baseURL: url.origin, relativePath: url.pathname }],
  });

  let molfile = '';
  let molecule: Molecule | null = null;
  if (ocl?.idCode) {
    molecule = Molecule.fromIDCode(ocl.idCode);
    molfile = molecule.toMolfileV3();
  } else if (smiles) {
    molecule = Molecule.fromSmiles(smiles);
    molfile = molecule.toMolfileV3();
  }

  const spectraData: any[] = [];

  for (const spectrum of spectra) {
    if (spectrum.info.dimension === 1) {
      let sum = 0;
      if (molecule) {
        sum = getSum(
          molecule.getMolecularFormula().formula,
          nucleusToString(spectrum.info.nucleus),
        );
      }

      spectraData.push({
        ...spectrum,
        ranges: {
          options: { sum: sum || 100 },
          values: mapRanges(ranges, spectrum as Spectrum1D),
        },
      });
    }
  }

  const exportedData = core.serializeNmriumState(
    {
      version,
      data: {
        sources,
        spectra: spectraData,
        ...(molfile && { molecules: [{ molfile }] }),
      },
    } as NmriumState,
    { includeData: 'dataSource' },
  );

  const name = names?.[0] || 'experiment';
  const blob = await exportAsJsonBlob(exportedData, name, 2);
  saveAs({ blob, name, extension: '.nmrium' });
}
