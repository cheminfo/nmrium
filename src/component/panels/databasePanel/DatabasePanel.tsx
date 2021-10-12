/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useAccordionContext } from 'analysis-ui-components';
import { DatabaseNMREntry } from 'nmr-processing/lib/databases/DatabaseNMREntry';
import { useCallback, useState, useRef, memo, useEffect, useMemo } from 'react';
import ReactCardFlip from 'react-card-flip';

import {
  initiateDatabase,
  getDatabasesNames,
  InitiateDatabaseResult,
  prepareData,
} from '../../../data/data1d/database';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Input from '../../elements/Input';
import Select, { SelectEntry } from '../../elements/Select';
import { RESURRECTING_SPECTRUM_FROM_RANGES } from '../../reducer/types/Types';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import DatabasePreferences from './DatabasePreferences';
import DatabaseTable from './DatabaseTable';

const style = css`
  .header {
    height: 36px;
    padding: 2px 0px;
  }
  .input-container {
    width: 100%;
  }
  .search-input {
    width: 100% !important;
    border-radius: 5px;
    border: 0.55px solid gray;
    padding: 5px;
    outline: none;
  }
`;

export interface DatabaseInnerProps {
  nucleus: string;
}

interface ResultEntry {
  data: DatabaseNMREntry[];
  databases: SelectEntry[];
  solvents: SelectEntry[];
}

function DatabasePanelInner({ nucleus }: DatabaseInnerProps) {
  const dispatch = useDispatch();
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef<any>();
  const searchKeywords = useRef<[string, string]>(['', '']);
  const databaseInstance = useRef<InitiateDatabaseResult | null>(null);
  const [result, setResult] = useState<ResultEntry>({
    data: [],
    databases: [],
    solvents: [],
  });
  const { item } = useAccordionContext('Database');

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
    if (!isFlipped) {
      settingRef.current.cancelSetting();
    }
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

  useEffect(() => {
    if (item?.isOpen) {
      setTimeout(() => {
        const databases = mapDatabasesToSelect(getDatabasesNames());
        databaseInstance.current = initiateDatabase(databases[0].key, nucleus);
        const data = databaseInstance.current.data;
        const solvents = mapSolventsToSelect(
          databaseInstance.current.getSolvents(),
        );

        setResult({ data, databases, solvents });
      });
    }
  }, [item?.isOpen, nucleus]);

  const handleSearch = useCallback((input) => {
    if (typeof input === 'string' || input === -1) {
      searchKeywords.current[0] = input === -1 ? '' : input;
    } else {
      searchKeywords.current[1] = input.target.value;
    }
    setTimeout(() => {
      if (databaseInstance.current) {
        const data = databaseInstance.current.search(searchKeywords.current);
        setResult((prevResult) => ({ ...prevResult, data }));
      }
    });
  }, []);

  const handleChangeDatabase = useCallback(
    (databaseKey) => {
      databaseInstance.current = initiateDatabase(databaseKey, nucleus);
      const data = databaseInstance.current.data;
      const solvents = mapSolventsToSelect(
        databaseInstance.current.getSolvents(),
      );
      searchKeywords.current = ['', ''];
      setResult((prevResult) => ({ ...prevResult, data, solvents }));
    },
    [nucleus],
  );

  const tableData = useMemo(() => {
    return prepareData(result.data);
  }, [result.data]);

  const resurrectHandler = useCallback(
    (row) => {
      const { index } = row.original;
      const { ranges, solvent } = result.data[index];
      dispatch({
        type: RESURRECTING_SPECTRUM_FROM_RANGES,
        payload: { ranges, info: { solvent, nucleus } },
      });
    },
    [dispatch, nucleus, result.data],
  );

  return (
    <div
      css={[
        tablePanelStyle,
        style,
        isFlipped &&
          css`
            th {
              position: relative;
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
          <Select
            style={{ flex: 2 }}
            data={result.databases}
            onChange={handleChangeDatabase}
          />
          <Select
            style={{ flex: 1 }}
            data={result.solvents}
            onChange={handleSearch}
          />
          <Input
            style={{ container: { flex: 3 } }}
            className="search-input"
            debounceTime={1000}
            placeholder="Search for parameter..."
            onChange={handleSearch}
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
        <ReactCardFlip
          isFlipped={isFlipped}
          infinite
          containerStyle={{ overflow: 'hidden', height: '100%' }}
        >
          <div className="table-container">
            <DatabaseTable data={tableData} onAdd={resurrectHandler} />
          </div>
          <DatabasePreferences ref={settingRef} />
        </ReactCardFlip>
      </div>
    </div>
  );
}

const MemoizedDatabasePanel = memo(DatabasePanelInner);

export default function PeaksPanel() {
  const { activeTab } = useChartData();
  if (!activeTab) return <div />;
  return <MemoizedDatabasePanel nucleus={activeTab} />;
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
  return databases.map(({ id, name }) => ({
    key: id,
    value: id,
    label: name,
  }));
}
