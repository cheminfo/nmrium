import type { Database, NmriumState, Spectrum1D } from 'nmr-load-save';
import { readFromWebSource, serializeNmriumState } from 'nmr-load-save';
import type { DatabaseNMREntry } from 'nmr-processing';
import { mapRanges } from 'nmr-processing';
import OCL from 'openchemlib/full';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAccordionContext, useOnOff } from 'react-science/ui';

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
import { useDispatch } from '../../context/DispatchContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import { EmptyText } from '../../elements/EmptyText.js';
import { useFormatNumberByNucleus } from '../../hooks/useFormatNumberByNucleus.js';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus.js';
import { options } from '../../toolbar/ToolTypes.js';
import Events from '../../utility/Events.js';
import { exportAsJSON } from '../../utility/export.js';
import nucleusToString from '../../utility/nucleusToString.js';
import { PanelNoData } from '../PanelNoData.js';
import { TablePanel } from '../extra/BasicPanelStyle.js';
import type { SettingsRef } from '../extra/utilities/settingImperativeHandle.js';
import PreferencesHeader from '../header/PreferencesHeader.js';

import DatabasePreferences from './DatabasePreferences.js';
import { DatabaseSearchOptions } from './DatabaseSearchOptions.js';
import { DatabaseStructureSearchModal } from './DatabaseStructureSearchModal.js';
import DatabaseTable from './DatabaseTable.js';

export type Databases = Array<LocalDatabase | Database>;

export interface DatabaseInnerProps {
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
  const { item } = useAccordionContext('Databases');

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
    function handle(event) {
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
    (databaseKey) => {
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
              .then((databaseRecords) =>
                databaseRecords.map((record) => ({
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
    if (item?.isOpen && defaultDatabase && !databaseInstance.current) {
      handleChangeDatabase(defaultDatabase);
    }
  }, [databases, defaultDatabase, handleChangeDatabase, item?.isOpen, nucleus]);

  const tableData = useMemo(() => {
    return prepareData(result.data);
  }, [result.data]);

  const resurrectHandler = useCallback(
    (rowData) => {
      const { index, baseURL, jcampURL: jcampRelativeURL } = rowData;
      const databaseEntry = result.data[index];
      if (jcampRelativeURL) {
        const url = new URL(jcampRelativeURL, baseURL);
        setTimeout(async () => {
          const hideLoading = toaster.showLoading({
            message: `load jcamp in progress...`,
          });
          try {
            const { data } = await readFromWebSource({
              entries: [{ baseURL: url.origin, relativePath: url.pathname }],
            });
            const spectrum = data?.spectra?.[0] || null;
            if (spectrum && isSpectrum1D(spectrum)) {
              dispatch({
                type: 'RESURRECTING_SPECTRUM',
                payload: { source: 'jcamp', databaseEntry, spectrum },
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
          payload: { source: 'rangesOrSignals', databaseEntry },
        });
      }
    },
    [dispatch, result.data, toaster],
  );
  const saveHandler = useCallback(
    (row) => {
      if (row?.jcampURL) {
        setTimeout(async () => {
          const hideLoading = toaster.showLoading({
            message: `Download jcamp in progress...`,
          });

          try {
            await saveJcampAsJson(row, result);
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
    [result, toaster],
  );
  const removeHandler = useCallback(
    (row) => {
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
    setIdCode(idCodeValue);
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
          <DatabaseStructureSearchModal
            isOpen={isOpenSearchByStructure}
            onClose={closeSearchByStructure}
            onChange={searchByStructureHandler}
            idCode={idCode}
          />
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

async function saveJcampAsJson(rowData, filteredData) {
  const { index, baseURL, jcampURL, names, ocl = {}, smiles } = rowData;
  const { ranges } = filteredData.data[index];
  const url = new URL(jcampURL, baseURL);
  const { data: { spectra, source } = { source: {}, spectra: [] }, version } =
    await readFromWebSource({
      entries: [{ baseURL: url.origin, relativePath: url.pathname }],
    });

  let molfile = '';
  let molecule: OCL.Molecule | null = null;
  if (ocl?.idCode) {
    molecule = OCL.Molecule.fromIDCode(ocl.idCode);
    molfile = molecule.toMolfileV3();
  } else if (smiles) {
    molecule = OCL.Molecule.fromSmiles(smiles);
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

  const exportedData = serializeNmriumState(
    {
      version,
      data: {
        source,
        spectra: spectraData,
        ...(molfile && { molecules: [{ molfile }] }),
      },
    } as NmriumState,
    { includeData: 'dataSource' },
  );

  await exportAsJSON(exportedData, names?.[0], 1);
}
