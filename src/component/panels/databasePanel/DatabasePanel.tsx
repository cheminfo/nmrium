/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { DatabaseNMREntry } from 'nmr-processing';
import { useCallback, useState, useRef, memo, useEffect, useMemo } from 'react';
import { FaICursor } from 'react-icons/fa';
import { IoSearchOutline } from 'react-icons/io5';

import {
  initiateDatabase,
  InitiateDatabaseResult,
  prepareData,
} from '../../../data/data1d/database';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Input from '../../elements/Input';
import Select, { SelectEntry } from '../../elements/Select';
import ToggleButton from '../../elements/ToggleButton';
import { useAlert } from '../../elements/popup/Alert';
import useToolsFunctions from '../../hooks/useToolsFunctions';
import { RESURRECTING_SPECTRUM_FROM_RANGES } from '../../reducer/types/Types';
import { options } from '../../toolbar/ToolTypes';
import Events from '../../utility/Events';
import { useFormatNumberByNucleus } from '../../utility/FormatNumber';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import DatabasePreferences from './DatabasePreferences';
import DatabaseTable from './DatabaseTable';
import { useDatabases } from './useDatabases';
import NoTableData from '../extra/placeholder/NoTableData';

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
  .smiles-container svg {
    display: block;
    margin: 0 auto;
  }
`;

export interface DatabaseInnerProps {
  nucleus: string;
  selectedTool: string;
}

interface ResultEntry {
  data: DatabaseNMREntry[];
  databases: SelectEntry[];
  solvents: SelectEntry[];
}

const emptyKeywords = {
  solvent: '',
  searchKeywords: '',
};

function DatabasePanelInner({ nucleus, selectedTool }: DatabaseInnerProps) {
  const dispatch = useDispatch();
  const alert = useAlert();
  const { handleChangeOption } = useToolsFunctions();
  const format = useFormatNumberByNucleus(nucleus);
  const databases = useDatabases();
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef<any>();
  const [keywords, setKeywords] = useState<{
    solvent: string;
    searchKeywords: string;
  }>(emptyKeywords);
  const databaseInstance = useRef<InitiateDatabaseResult | null>(null);
  const [result, setResult] = useState<ResultEntry>({
    data: [],
    databases: [],
    solvents: [],
  });

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
    setTimeout(() => {
      if (databaseInstance.current) {
        if (!solvent && !searchKeywords) {
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
      }
    });
  }, [keywords]);

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
    (databaseIndex) => {
      void (async () => {
        let _database: DatabaseNMREntry[] = [];
        const { url, label, value } = databases[databaseIndex];
        if (url) {
          const hideLoading = await alert.showLoading(`load ${label} database`);

          try {
            _database = await fetch(url).then((response) => response.json());
          } catch (e) {
            alert.error(`Failed to load ${url}`);
          } finally {
            hideLoading();
          }
        } else {
          _database = value as DatabaseNMREntry[];
        }
        databaseInstance.current = initiateDatabase(_database, nucleus);
        setKeywords({ ...emptyKeywords });
      })();
    },
    [alert, databases, nucleus],
  );

  const tableData = useMemo(() => {
    return prepareData(result.data);
  }, [result.data]);

  const resurrectHandler = useCallback(
    (row) => {
      const { index } = row.original;
      const { ranges, solvent, names = [] } = result.data[index];
      dispatch({
        type: RESURRECTING_SPECTRUM_FROM_RANGES,
        payload: { ranges, info: { solvent, nucleus, name: names[0] } },
      });
    },
    [dispatch, nucleus, result.data],
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
            data={mapDatabasesToSelect(databases)}
            onChange={handleChangeDatabase}
            placeholder="Select database"
          />
          <Select
            style={{ flex: 1 }}
            data={result.solvents}
            placeholder="Solvent"
            onChange={handleSearch}
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
                databases && databases.length > 0
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
  if (!activeTab) return <div />;
  return (
    <MemoizedDatabasePanel nucleus={activeTab} selectedTool={selectedTool} />
  );
}

function mapSolventsToSelect(solvents: string[]) {
  const result = solvents.map((key) => {
    return {
      key,
      label: key,
      value: key,
    };
  }, []);
  result.unshift({ key: '-1', label: 'All', value: '-1' });
  return result;
}

function mapDatabasesToSelect(databases) {
  return databases.map(({ label }, index) => ({
    key: index,
    value: index,
    label,
  }));
}
