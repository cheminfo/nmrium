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
import type {
  InitiateDatabaseResult,
  LocalDatabase,
} from '../../../data/data1d/database.js';
import {
  DATA_BASES,
  initiateDatabase,
  prepareData,
} from '../../../data/data1d/database.js';
import type { BrushTrackerData } from '../../EventsTrackers/BrushTracker.tsx';
import { useChartData } from '../../context/ChartContext.js';
import { useCore } from '../../context/CoreContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useMapKeyModifiers } from '../../context/KeyModifierContext.tsx';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import { EmptyText } from '../../elements/EmptyText.js';
import { useFormatNumberByNucleus } from '../../hooks/useFormatNumberByNucleus.js';
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

function resolveNucleus(
  nucleus: string | undefined,
  currentPick: string | undefined,
  distinctNuclei: string[],
): string | undefined {
  if (nucleus) return nucleus;
  if (currentPick && distinctNuclei.includes(currentPick)) return currentPick;
  return distinctNuclei[0];
}

function getDistinctNuclei(entries: DatabaseNMREntry[]): string[] {
  const nuclei = new Set<string>();
  for (const record of entries) {
    if (record.nucleus) {
      nuclei.add(record.nucleus);
    }
  }
  return Array.from(nuclei);
}

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
  nucleus?: string;
  selectedTool: string;
  databases: Databases;
  defaultDatabase: string;
}

export interface DatabaseSearchKeywords {
  solvent: string;
  searchKeywords: string;
}

export interface DatabaseSearchResultEntry {
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

function resolveSpectraURL(
  rowData: {
    baseURL: string;
    jcampURL: string;
    jcampFullURL: string;
  },
  isFullJcamp: boolean,
): URL | null {
  const { baseURL, jcampURL, jcampFullURL } = rowData;
  const spectraURL = isFullJcamp ? jcampFullURL : jcampURL;

  if (!spectraURL) return null;

  return new URL(spectraURL, baseURL);
}

function DatabasePanelInner({
  nucleus,
  selectedTool,
  databases,
  defaultDatabase,
}: DatabaseInnerProps) {
  const dispatch = useDispatch();
  const toaster = useToaster();

  const [availableNuclei, setAvailableNuclei] = useState<string[]>([]);
  const [selectedNucleus, setSelectedNucleus] = useState<string | undefined>(
    nucleus,
  );
  const effectiveNucleus = nucleus ?? selectedNucleus;

  const format = useFormatNumberByNucleus(effectiveNucleus);
  const [isFlipped, setFlipStatus] = useState(false);
  const [
    isOpenSearchByStructure,
    openSearchByStructure,
    closeSearchByStructure,
  ] = useOnOff(false);
  const settingRef = useRef<SettingsRef | null>(null);

  const [keywords, setKeywords] =
    useState<DatabaseSearchKeywords>(emptyKeywords);
  const [idCode, setIdCode] = useState<string>();

  const databaseInstance = useRef<InitiateDatabaseResult | null>(null);
  const databaseDataRef = useRef<DatabaseNMREntry[]>([]);
  const { getModifiersKey, primaryKeyIdentifier } = useMapKeyModifiers();

  const [result, setResult] = useState<DatabaseSearchResultEntry>({
    data: [],
    databases: [],
    solvents: [],
  });

  function settingsPanelHandler() {
    setFlipStatus((flag) => !flag);
  }

  async function saveSettingHandler() {
    const isSettingValid = await settingRef.current?.saveSetting();
    if (isSettingValid) setFlipStatus(false);
  }

  const runSearch = useCallback(
    (options?: {
      keywords?: DatabaseSearchKeywords;
      idCode?: string;
      solvents?: any[];
    }) => {
      const instance = databaseInstance.current;
      if (!instance) return;

      const {
        keywords: overrideKeywords,
        idCode: overrideIdCode,
        solvents,
      } = options ?? {};

      const { solvent, searchKeywords } = overrideKeywords ?? keywords;
      const effectiveIdCode =
        overrideIdCode !== undefined ? overrideIdCode : idCode;

      const keywordArray = mapKeywordsToArray(searchKeywords, solvent);
      const data = instance.search({
        keywords: keywordArray,
        idCode: effectiveIdCode,
      });

      setResult((prev) => ({
        ...prev,
        data,
        ...(solvents && { solvents }),
      }));
    },
    [keywords, idCode],
  );
  const buildInstanceAndSearch = useCallback(
    async (data: DatabaseNMREntry[], nucleusToUse: string) => {
      const hideLoading = await toaster.showAsyncLoading({
        message: 'Loading the database',
      });

      databaseInstance.current = initiateDatabase(data, nucleusToUse);
      const solvents = mapSolventsToSelect(
        databaseInstance.current.getSolvents(),
      );

      setKeywords(emptyKeywords);
      setIdCode(undefined);
      runSearch({ keywords: emptyKeywords, solvents });
      hideLoading();
    },
    [toaster, runSearch],
  );

  const handleChangeDatabase = useCallback(
    (databaseKey: any) => {
      const database = databases.find((item) => item.key === databaseKey);

      setTimeout(async () => {
        let data: DatabaseNMREntry[];

        if (database?.url) {
          const { url, label } = database;
          const hideLoading = await toaster.showAsyncLoading({
            message: `load ${label} database`,
          });
          try {
            const records = await fetch(url).then((r) => r.json());
            data = records.map((record: any) => ({ ...record, baseURL: url }));
          } catch {
            toaster.show({
              message: `Failed to load ${url}`,
              intent: 'danger',
            });
            hideLoading();
            return;
          } finally {
            hideLoading();
          }
        } else {
          data =
            ((database as LocalDatabase)?.value as DatabaseNMREntry[]) ?? [];
        }

        databaseDataRef.current = data;

        const distinctNuclei = getDistinctNuclei(data);
        setAvailableNuclei(distinctNuclei);

        const nucleusToUse = resolveNucleus(
          nucleus,
          selectedNucleus,
          distinctNuclei,
        );
        setSelectedNucleus(nucleusToUse);

        if (!nucleusToUse) {
          databaseInstance.current = null;
          setKeywords(emptyKeywords);
          setResult({ data: [], databases: [], solvents: [] });
          return;
        }

        await buildInstanceAndSearch(data, nucleusToUse);
      }, 0);
    },
    [databases, nucleus, selectedNucleus, toaster, buildInstanceAndSearch],
  );

  const handleNucleusChange = useCallback(
    (newNucleus: string) => {
      setSelectedNucleus(newNucleus);
      void buildInstanceAndSearch(databaseDataRef.current, newNucleus);
    },
    [buildInstanceAndSearch],
  );

  const handleKeywordsChange = useCallback(
    (partial: Partial<DatabaseSearchKeywords>) => {
      setKeywords((prev) => {
        const next = { ...prev, ...partial };
        runSearch({ keywords: next });
        return next;
      });
    },
    [runSearch],
  );

  const searchByStructureHandler = useCallback(
    (idCodeValue: string) => {
      const molecule = Molecule.fromIDCode(idCodeValue);
      const atoms = molecule.getAllAtoms();
      const nextIdCode = atoms > 0 ? idCodeValue : '';
      setIdCode(nextIdCode);
      runSearch({ idCode: nextIdCode });
    },
    [runSearch],
  );

  useEffect(() => {
    function handle(event: BrushTrackerData & { range: [number, number] }) {
      const keyModifiers = getModifiersKey(event);
      if (
        selectedTool !== options.databaseRangesSelection.id ||
        keyModifiers !== primaryKeyIdentifier
      ) {
        return;
      }

      setKeywords((prevState) => {
        const oldKeywords = prevState.searchKeywords
          ? prevState.searchKeywords.split(' ')
          : [];
        const [from, to] = event.range;
        const nextKeywords = {
          ...prevState,
          searchKeywords: [
            ...oldKeywords,
            `delta:${format(from)}..${format(to)}`,
          ].join(' '),
        };
        runSearch({ keywords: nextKeywords });
        return nextKeywords;
      });
    }

    Events.on('brushEnd', handle);

    return () => {
      Events.off('brushEnd', handle);
    };
  }, [format, getModifiersKey, primaryKeyIdentifier, selectedTool, runSearch]);

  useEffect(() => {
    if (defaultDatabase && !databaseInstance.current) {
      handleChangeDatabase(defaultDatabase);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultDatabase]);

  const tableData = useMemo(() => prepareData(result.data), [result.data]);

  const core = useCore();
  const resurrectHandler = useCallback(
    (rowData: any, isFullJcamp = false) => {
      const { index, ocl, smiles } = rowData;
      const molfile = getMolfile({ ocl, smiles });
      const databaseEntry = result.data[index];

      const spectraURL = resolveSpectraURL(rowData, isFullJcamp);

      if (!spectraURL) {
        dispatch({
          type: 'RESURRECTING_SPECTRUM_FROM_SIGNALS_OR_RANGES',
          payload: { databaseEntry, molfile },
        });
        return;
      }

      setTimeout(async () => {
        const hideLoading = toaster.showLoading({
          message: `load jcamp in progress...`,
        });

        try {
          const {
            state: { data },
          } = await core.readFromWebSource({
            entries: [
              { baseURL: spectraURL.origin, relativePath: spectraURL.pathname },
            ],
          });
          dispatch({
            type: 'RESURRECTING_SPECTRUM_FROM_JCAMP',
            payload: { databaseEntry, spectra: data?.spectra || [], molfile },
          });
        } catch {
          toaster.show({ message: 'Failed to load Jcamp', intent: 'danger' });
        } finally {
          hideLoading();
        }
      }, 0);
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

  const removeAllHandler = useCallback(() => {
    dispatch({
      type: 'DELETE_SPECTRA',
      payload: {
        spectrumSource: 'database',
        domainOptions: { isYDomainShared: false, updateYDomain: false },
      },
    });
  }, [dispatch]);

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
            onKeywordsChange={handleKeywordsChange}
            onSettingClick={settingsPanelHandler}
            onStructureClick={openSearchByStructure}
            onDatabaseChange={handleChangeDatabase}
            onRemoveAll={removeAllHandler}
            onNucleiChange={handleNucleusChange}
            availableNuclei={availableNuclei}
            selectedNucleus={selectedNucleus}
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

  if (displayerMode !== '1D') {
    return (
      <PanelNoData>
        Databases are only available when 1D experimental spectrum is displayed.
        It will automatically select the corresponding nucleus
      </PanelNoData>
    );
  }
  return (
    <MemoizedDatabasePanel
      nucleus={activeTab || undefined}
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
  const {
    state: { data: { spectra = [], sources = [] } = {}, version },
  } = await core.readFromWebSource({
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
