import { BsHexagon, BsHexagonFill } from 'react-icons/bs';
import { FaICursor } from 'react-icons/fa';
import { IoSearchOutline } from 'react-icons/io5';
import { TbBinaryTree } from 'react-icons/tb';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import ActiveButton from '../../elements/ActiveButton';
import Button from '../../elements/Button';
import { CounterLabel } from '../../elements/CounterLabel';
import Input from '../../elements/Input';
import { PreferencesButton } from '../../elements/PreferencesButton';
import Select from '../../elements/Select';
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
  idCode,
  total,
  onKeywordsChange,
  onSettingClick,
  onStructureClick,
  onDatabaseChange,
}: DatabaseSearchOptionsProps) {
  const { handleChangeOption } = useToolsFunctions();
  const {
    view: {
      spectra: { showSimilarityTree },
    },
    toolOptions: { selectedTool },
  } = useChartData();
  const dispatch = useDispatch();
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

  function handleShowSimilarityTree() {
    dispatch({ type: 'TOGGLE_SIMILARITY_TREE' });
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
        <ActiveButton
          popupTitle={`${showSimilarityTree ? 'Hide' : 'Show'} similarity tree`}
          popupPlacement="right"
          onClick={handleShowSimilarityTree}
          value={showSimilarityTree}
          style={{ marginRight: '5px' }}
        >
          <TbBinaryTree style={{ pointerEvents: 'none', fontSize: '12px' }} />
        </ActiveButton>

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
        <ActiveButton
          popupTitle="Filter by select ranges"
          popupPlacement="right"
          onClick={enableFilterHandler}
          value={selectedTool === options.databaseRangesSelection.id}
          style={{ marginRight: '5px' }}
        >
          <FaICursor
            style={{
              pointerEvents: 'none',
              fontSize: '12px',
              transform: 'rotate(90deg)',
            }}
          />
        </ActiveButton>

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
