/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  Database,
  NmriumState,
  Spectrum1D,
  readFromWebSource,
  serializeNmriumState,
} from 'nmr-load-save';
import { DatabaseNMREntry, mapRanges } from 'nmr-processing';
import OCL from 'openchemlib/full';
import { useCallback, useState, useRef, memo, useEffect, useMemo } from 'react';
import { useAccordionContext, useOnOff } from 'react-science/ui';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D';
import { getSum } from '../../../data/data1d/Spectrum1D/SumManager';
import {
  initiateDatabase,
  InitiateDatabaseResult,
  prepareData,
  DATA_BASES,
  LocalDatabase,
} from '../../../data/data1d/database';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useAlert } from '../../elements/popup/Alert';
import { useFormatNumberByNucleus } from '../../hooks/useFormatNumberByNucleus';
import { options } from '../../toolbar/ToolTypes';
import Events from '../../utility/Events';
import { exportAsJSON } from '../../utility/export';
import nucleusToString from '../../utility/nucleusToString';
import { PanelNoData } from '../PanelNoData';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import NoTableData from '../extra/placeholder/NoTableData';
import PreferencesHeader from '../header/PreferencesHeader';

import DatabasePreferences from './DatabasePreferences';
import { DatabaseSearchOptions } from './DatabaseSearchOptions';
import { DatabaseStructureSearchModal } from './DatabaseStructureSearchModal';
import DatabaseTable from './DatabaseTable';

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
  const values = searchKeywords ? searchKeywords.split(' ') : [];
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
  const alert = useAlert();
  const { item } = useAccordionContext('Databases');

  const format = useFormatNumberByNucleus(nucleus);
  const [isFlipped, setFlipStatus] = useState(false);
  const [
    isOpenSearchByStructure,
    openSearchByStructure,
    closeSearchByStructure,
  ] = useOnOff(false);
  const settingRef = useRef<any>();
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

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

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
    const { solvent, searchKeywords } = keywords;
    setTimeout(async () => {
      if (databaseInstance.current) {
        const hideLoading = await alert.showLoading(`Preparing of the Result`);
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
    }, 0);
  }, [alert, idCode, keywords, search]);

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
    setTimeout(async () => {
      if (databaseInstance.current) {
        const hideLoading = await alert.showLoading(`Loading the database`);

        databaseInstance.current = initiateDatabase(
          databaseDataRef.current,
          nucleus,
        );
        hideLoading();
        setKeywords({ ...emptyKeywords });
      }
    }, 0);
  }, [alert, nucleus]);

  const handleChangeDatabase = useCallback(
    (databaseKey) => {
      const database = databases.find((item) => item.key === databaseKey);

      setTimeout(async () => {
        if (database?.url) {
          const { url, label } = database;

          const hideLoading = await alert.showLoading(`load ${label} database`);

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
            alert.error(`Failed to load ${url}`);
          } finally {
            hideLoading();
          }
        } else {
          databaseDataRef.current = (database as LocalDatabase)
            ?.value as DatabaseNMREntry[];
        }

        const hideLoading = await alert.showLoading(`Loading the database`);

        databaseInstance.current = initiateDatabase(
          databaseDataRef.current,
          nucleus,
        );

        setKeywords({ ...emptyKeywords });

        hideLoading();
      }, 0);
    },
    [alert, databases, nucleus],
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
      const { ranges, solvent, names = [] } = result.data[index];

      if (jcampRelativeURL) {
        const url = new URL(jcampRelativeURL, baseURL);
        setTimeout(async () => {
          const hideLoading = await alert.showLoading(
            `load jcamp in progress...`,
          );
          try {
            const { data } = await readFromWebSource({
              entries: [{ baseURL: url.origin, relativePath: url.pathname }],
            });

            const spectrum = data?.spectra?.[0] || null;
            if (spectrum && isSpectrum1D(spectrum)) {
              dispatch({
                type: 'RESURRECTING_SPECTRUM_FROM_JCAMP',
                payload: { ranges, spectrum },
              });
            }
          } catch {
            alert.error(`Failed to load Jcamp`);
          } finally {
            hideLoading();
          }
        }, 0);
      } else {
        dispatch({
          type: 'RESURRECTING_SPECTRUM_FROM_RANGES',
          payload: { ranges, info: { solvent, nucleus, name: names[0] } },
        });
      }
    },
    [alert, dispatch, nucleus, result.data],
  );
  const saveHandler = useCallback(
    (row) => {
      if (row?.jcampURL) {
        setTimeout(async () => {
          const hideLoading = await alert.showLoading(
            `Download jcamp in progress...`,
          );

          try {
            await saveJcampAsJson(row, result);
            hideLoading();
          } catch {
            alert.error(`Failed to download the jcamp`);
          } finally {
            hideLoading();
          }
        }, 0);
      } else {
        alert.error(`No jcamp file to save`);
      }
    },
    [alert, result],
  );
  const searchByStructureHandler = (idCodeValue: string) => {
    setIdCode(idCodeValue);
  };
  return (
    <div
      css={[
        tablePanelStyle,
        isFlipped &&
          css`
            .table-container {
              table,
              th {
                position: relative !important;
              }
            }
          `,
      ]}
    >
      {!isFlipped && (
        <>
          <DatabaseSearchOptions
            databases={databases}
            defaultDatabase={defaultDatabase}
            idCode={idCode}
            keywords={keywords}
            result={result}
            selectedTool={selectedTool}
            total={databaseInstance.current?.data.length || 0}
            onKeywordsChange={(options) =>
              setKeywords((prevKeywords) => ({ ...prevKeywords, ...options }))
            }
            onSettingClick={settingsPanelHandler}
            onStructureClick={openSearchByStructure}
            onDatabaseChange={handleChangeDatabase}
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
              onSave={saveHandler}
            />
          ) : (
            <NoTableData
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
    </div>
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
