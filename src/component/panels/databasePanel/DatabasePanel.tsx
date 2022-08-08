/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useAccordionContext } from 'analysis-ui-components';
import { DatabaseNMREntry } from 'nmr-processing';
import { useCallback, useState, useRef, memo, useEffect, useMemo } from 'react';
import { BsHexagon, BsHexagonFill } from 'react-icons/bs';
import { FaICursor } from 'react-icons/fa';
import { IoSearchOutline } from 'react-icons/io5';

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
import Button from '../../elements/Button';
import Input from '../../elements/Input';
import Select from '../../elements/Select';
import ToggleButton from '../../elements/ToggleButton';
import { useAlert } from '../../elements/popup/Alert';
import { positions, transitions, useModal } from '../../elements/popup/Modal';
import { useFormatNumberByNucleus } from '../../hooks/useFormatNumberByNucleus';
import useToolsFunctions from '../../hooks/useToolsFunctions';
import {
  RESURRECTING_SPECTRUM_FROM_JCAMP,
  RESURRECTING_SPECTRUM_FROM_RANGES,
} from '../../reducer/types/Types';
import { options } from '../../toolbar/ToolTypes';
import Events from '../../utility/Events';
import { loadFile } from '../../utility/FileUtility';
import { Database } from '../../workspaces/Workspace';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import NoTableData from '../extra/placeholder/NoTableData';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import DatabasePreferences from './DatabasePreferences';
import { DatabaseStructureSearchModal } from './DatabaseStructureSearchModal';
import DatabaseTable from './DatabaseTable';

const style = css`
  .header {
    height: 30px;
    padding: 2px 0px 2px 5px;
  }
  .input-container {
    width: 100%;
  }
  .search-input {
    width: 100% !important;
    border-radius: 5px;
    border: 0.55px solid gray;
    padding: 0 5px;
    outline: none;
  }
`;

export interface DatabaseInnerProps {
  nucleus: string;
  selectedTool: string;
  databases: (LocalDatabase | Database)[];
  defaultDatabase: string;
}

interface ResultEntry {
  data: DatabaseNMREntry[];
  databases: { key: string; value: string }[];
  solvents: { label: string; value: string }[];
}

const emptyKeywords = {
  solvent: '-1',
  searchKeywords: '',
};

function DatabasePanelInner({
  nucleus,
  selectedTool,
  databases,
  defaultDatabase,
}: DatabaseInnerProps) {
  const dispatch = useDispatch();
  const alert = useAlert();
  const modal = useModal();
  const { item } = useAccordionContext('Databases');

  const { handleChangeOption } = useToolsFunctions();
  const format = useFormatNumberByNucleus(nucleus);
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef<any>();
  const [keywords, setKeywords] = useState<{
    solvent: string;
    searchKeywords: string;
  }>(emptyKeywords);
  const databaseInstance = useRef<InitiateDatabaseResult | null>(null);
  const databaseDataRef = useRef<DatabaseNMREntry[]>([]);
  const [result, setResult] = useState<ResultEntry>({
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

  const handleSearch = useCallback((input) => {
    if (typeof input === 'string' || input === -1) {
      const solvent = String(input);
      setKeywords((prevState) => ({ ...prevState, solvent }));
    } else {
      setKeywords((prevState) => ({
        ...prevState,
        searchKeywords: input.target.value,
      }));
    }
  }, []);

  useEffect(() => {
    const { solvent, searchKeywords } = keywords;
    setTimeout(async () => {
      if (databaseInstance.current) {
        const hideLoading = await alert.showLoading(`Preparing of the Result`);
        if (solvent === '-1' && !searchKeywords) {
          const data = databaseInstance.current.data;
          const solvents = mapSolventsToSelect(
            databaseInstance.current.getSolvents(),
          );

          setResult((prevResult) => ({ ...prevResult, data, solvents }));
        } else {
          const values = [...searchKeywords.split(' ')];
          if (solvent !== '-1') {
            values.unshift(`solvent:${solvent}`);
          }

          const data = databaseInstance.current.search(values.join(' '));
          setResult((prevResult) => ({ ...prevResult, data }));
        }
        hideLoading();
      }
    }, 0);
  }, [alert, keywords]);

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
          } catch (e) {
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

  useEffect(() => {
    if (item?.isOpen && defaultDatabase && !databaseInstance.current) {
      handleChangeDatabase(defaultDatabase);
    }
  }, [databases, defaultDatabase, handleChangeDatabase, item?.isOpen, nucleus]);

  const tableData = useMemo(() => {
    return prepareData(result.data);
  }, [result.data]);

  const resurrectHandler = useCallback(
    (row) => {
      const { index, baseURL, jcampURL: jcampRelativeURL } = row.original;
      const { ranges, solvent, names = [] } = result.data[index];

      if (jcampRelativeURL) {
        setTimeout(async () => {
          const hideLoading = await alert.showLoading(
            `load jcamp in progress...`,
          );

          try {
            const jcampURL = new URL(jcampRelativeURL, baseURL);

            const result = await loadFile(jcampURL);

            dispatch({
              type: RESURRECTING_SPECTRUM_FROM_JCAMP,
              payload: { file: result, ranges, jcampURL },
            });
          } catch (e) {
            alert.error(`Failed to load Jcamp`);
          } finally {
            hideLoading();
          }
        }, 0);
      } else {
        dispatch({
          type: RESURRECTING_SPECTRUM_FROM_RANGES,
          payload: { ranges, info: { solvent, nucleus, name: names[0] } },
        });
      }
    },
    [alert, dispatch, nucleus, result.data],
  );

  const clearHandler = useCallback(() => {
    setKeywords((prevState) => ({ ...prevState, searchKeywords: '' }));
  }, []);

  const enableFilterHandler = useCallback(
    (flag) => {
      const tool = !flag ? options.zoom.id : options.databaseRangesSelection.id;
      handleChangeOption(tool);
    },
    [handleChangeOption],
  );

  const searchByStructureHandler = (idCodeValue: string) => {
    setTimeout(async () => {
      const hideLoading = await alert.showLoading(`Searching in progress...`);
      const data =
        databaseInstance.current?.searchByStructure(idCodeValue) || [];
      setResult((prevResult) => ({ ...prevResult, data }));
      setIdCode(idCodeValue);
      hideLoading();
    }, 0);
  };
  const openSearchByStructure = () => {
    modal.show(
      <DatabaseStructureSearchModal
        onChange={searchByStructureHandler}
        idCode={idCode}
      />,
      {
        position: positions.MIDDLE,
        transition: transitions.SCALE,
        isBackgroundBlur: false,
      },
    );
  };

  return (
    <div
      css={[
        tablePanelStyle,
        style,
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
        <DefaultPanelHeader
          showSettingButton
          onSettingClick={settingsPanelHandler}
          canDelete={false}
          className="header"
        >
          <ToggleButton
            key={`${selectedTool}`}
            defaultValue={selectedTool === options.databaseRangesSelection.id}
            popupTitle="Filter by select ranges"
            popupPlacement="right"
            onClick={enableFilterHandler}
          >
            <FaICursor
              style={{
                pointerEvents: 'none',
                fontSize: '12px',
                transform: 'rotate(90deg)',
              }}
            />
          </ToggleButton>
          <Select
            style={{ flex: 2 }}
            items={databases}
            itemTextField="label"
            itemValueField="key"
            onChange={handleChangeDatabase}
            placeholder="Select database"
            defaultValue={defaultDatabase}
          />
          <Select
            style={{ flex: 1 }}
            items={result.solvents}
            placeholder="Solvent"
            onChange={handleSearch}
            value={keywords.solvent}
          />
          <Input
            value={keywords.searchKeywords}
            renderIcon={() => <IoSearchOutline />}
            style={{ inputWrapper: { flex: 3 } }}
            className="search-input"
            type="text"
            debounceTime={250}
            placeholder="Search for parameter..."
            onChange={handleSearch}
            onClear={clearHandler}
            canClear
          />
          <Button.Done
            fill="clear"
            onClick={openSearchByStructure}
            style={{ marginLeft: '5px' }}
          >
            {!idCode ? (
              <BsHexagon
                style={{
                  fontSize: '14px',
                }}
              />
            ) : (
              <BsHexagonFill
                style={{
                  fontSize: '14px',
                }}
              />
            )}
          </Button.Done>
        </DefaultPanelHeader>
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
            <DatabaseTable data={tableData} onAdd={resurrectHandler} />
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
    activeTab,
    toolOptions: { selectedTool },
  } = useChartData();
  const { current } = usePreferences();
  const { data, defaultDatabase } = current.databases;
  const databases = DATA_BASES.concat(
    data.filter((datum) => datum.enabled),
  ) as (Database | LocalDatabase)[];

  if (!activeTab) return <div />;
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
  }, []);
  result.unshift({ label: 'All', value: '-1' });
  return result;
}
