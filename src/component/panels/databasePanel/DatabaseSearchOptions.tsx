import { BsHexagon, BsHexagonFill } from 'react-icons/bs';
import { FaICursor } from 'react-icons/fa';
import { IoSearchOutline } from 'react-icons/io5';

import Button from '../../elements/Button';
import { CounterLabel } from '../../elements/CounterLabel';
import Input from '../../elements/Input';
import { PreferencesButton } from '../../elements/PreferencesButton';
import Select from '../../elements/Select';
import ToggleButton from '../../elements/ToggleButton';
import useToolsFunctions from '../../hooks/useToolsFunctions';
import { options } from '../../toolbar/ToolTypes';
import { createFilterLabel } from '../header/DefaultPanelHeader';
import PanelHeader from '../header/PanelHeader';

import {
  DataBaseSearchResultEntry,
  DatabaseSearchKeywords,
  Databases,
} from './DatabasePanel';

type OnClick = React.ButtonHTMLAttributes<HTMLButtonElement>['onClick'];

interface DatabaseSearchOptionsProps {
  databases: Databases;
  defaultDatabase: string;
  keywords: DatabaseSearchKeywords;
  result: DataBaseSearchResultEntry;
  selectedTool: string;
  idCode?: string;
  total: number;
  onKeywordsChange: (k: Partial<DatabaseSearchKeywords>) => void;
  onSettingClick: OnClick;
  onStructureClick: OnClick;
  onDatabaseChange: (databaseKey: string) => void;
}

export function DatabaseSearchOptions({
  databases,
  defaultDatabase,
  keywords,
  result,
  selectedTool,
  idCode,
  total,
  onKeywordsChange,
  onSettingClick,
  onStructureClick,
  onDatabaseChange,
}: DatabaseSearchOptionsProps) {
  const { handleChangeOption } = useToolsFunctions();

  function enableFilterHandler(flag) {
    const tool = !flag ? options.zoom.id : options.databaseRangesSelection.id;
    handleChangeOption(tool);
  }

  function handleSearch(input) {
    if (typeof input === 'string' || input === -1) {
      const solvent = String(input);
      onKeywordsChange({ solvent });
    } else {
      onKeywordsChange({
        searchKeywords: input.target.value,
      });
    }
  }

  function clearHandler() {
    onKeywordsChange({ searchKeywords: '' });
  }

  return (
    <PanelHeader style={{ flexDirection: 'column', alignItems: 'normal' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingBottom: '2px',
        }}
      >
        <Select
          style={{ flex: 6 }}
          items={databases}
          itemTextField="label"
          itemValueField="key"
          onChange={onDatabaseChange}
          placeholder="Select database"
          defaultValue={defaultDatabase}
        />
        <Select
          style={{ flex: 4, margin: '0px 5px' }}
          items={result.solvents}
          placeholder="Solvent"
          onChange={handleSearch}
          value={keywords.solvent}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 2,
            justifyContent: 'flex-end',
          }}
        >
          <CounterLabel>
            {createFilterLabel(total || 0, result.data.length)}
          </CounterLabel>
          <PreferencesButton onClick={onSettingClick} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <ToggleButton
          key={selectedTool}
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
          onClick={onStructureClick}
          style={{ padding: '5px' }}
        >
          {!idCode ? (
            <BsHexagon
              style={{
                fontSize: '12px',
              }}
            />
          ) : (
            <BsHexagonFill
              style={{
                fontSize: '12px',
              }}
            />
          )}
        </Button.Done>
      </div>
    </PanelHeader>
  );
}
