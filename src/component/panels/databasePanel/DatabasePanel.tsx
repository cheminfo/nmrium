/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useAccordionContext } from 'analysis-ui-components';
import { DatabaseNMREntry } from 'nmr-processing/lib/databases/DatabaseNMREntry';
import { useCallback, useState, useRef, memo, useEffect, useMemo } from 'react';
import ReactCardFlip from 'react-card-flip';

import {
  initiateDatabase,
  getDatabasesNames,
} from '../../../data/data1d/database';
import { useChartData } from '../../context/ChartContext';
import Input from '../../elements/Input';
import Select from '../../elements/Select';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import DatabasePreferences from './DatabasePreferences';
import DatabaseTable from './DatabaseTable';

const styles = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

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

function DatabasePanelInner({ nucleus }: DatabaseInnerProps) {
  const [isFlipped, setFlipStatus] = useState(false);
  const [data, setData] = useState<DatabaseNMREntry[]>([]);
  const settingRef = useRef<any>();
  const searchKeywords = useRef<[string, string]>(['', '']);
  const databaseInstance = useRef(initiateDatabase('solvent', nucleus));
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

  const databaseList = useMemo(() => {
    return getDatabasesNames().map(({ id, name }) => ({
      key: id,
      value: id,
      label: name,
    }));
  }, []);

  const solventsList = useMemo(() => {
    let result: any = [];
    const solvents = databaseInstance.current.getSolvents();
    result = solvents.map((key) => {
      return {
        key,
        label: key,
        value: key,
      };
    }, []);
    result.unshift({ key: '-1', label: 'All', value: '-1' });
    return result;
  }, []);

  useEffect(() => {
    if (item?.isOpen) {
      const result = databaseInstance.current.search(searchKeywords.current);
      setTimeout(() => {
        setData(result);
      });
    }
  }, [item?.isOpen]);

  const handleSearch = useCallback((input) => {
    if (typeof input === 'string' || input === -1) {
      searchKeywords.current[0] = input === -1 ? '' : input;
    } else {
      searchKeywords.current[1] = input.target.value;
    }
    const result = databaseInstance.current.search(searchKeywords.current);
    setData(result);
  }, []);

  const handleChangeDatabase = useCallback(
    (databaseKey) => {
      databaseInstance.current = initiateDatabase(databaseKey, nucleus);
      const result = databaseInstance.current.search();
      searchKeywords.current = ['', ''];
      setData(result);
    },
    [nucleus],
  );

  return (
    <div css={styles}>
      {!isFlipped && (
        <DefaultPanelHeader
          showSettingButton
          onSettingClick={settingsPanelHandler}
          canDelete={false}
          className="header"
        >
          <Select
            style={{ flex: 2 }}
            data={databaseList}
            onChange={handleChangeDatabase}
          />
          <Select
            style={{ flex: 1 }}
            data={solventsList}
            onChange={handleSearch}
          />
          <Input
            style={{ container: { flex: 3 } }}
            className="search-input"
            debounceTime={500}
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
      <div style={{ height: '100%', overflow: 'hidden' }}>
        <ReactCardFlip
          isFlipped={isFlipped}
          infinite
          containerStyle={{ overflow: 'hidden', height: '100%' }}
        >
          <div style={{ overflow: 'auto', height: '100%', display: 'block' }}>
            <DatabaseTable data={data} />
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
