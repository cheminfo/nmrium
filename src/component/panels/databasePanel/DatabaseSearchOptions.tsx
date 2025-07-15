import { BsHexagon, BsHexagonFill } from 'react-icons/bs';
import { FaICursor, FaRegTrashAlt } from 'react-icons/fa';
import { IoSearchOutline } from 'react-icons/io5';
import { TbBinaryTree } from 'react-icons/tb';
import type { ToolbarItemProps } from 'react-science/ui';
import { PanelHeader, Toolbar } from 'react-science/ui';

import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import Input from '../../elements/Input.js';
import Select from '../../elements/Select.js';
import { ToolBarButton } from '../../elements/ToolBarButton.js';
import useToolsFunctions from '../../hooks/useToolsFunctions.js';
import { options } from '../../toolbar/ToolTypes.js';

import type {
  DataBaseSearchResultEntry,
  DatabaseSearchKeywords,
  Databases,
} from './DatabasePanel.js';

interface DatabaseSearchOptionsProps {
  databases: Databases;
  defaultDatabase: string;
  keywords: DatabaseSearchKeywords;
  result: DataBaseSearchResultEntry;
  idCode?: string;
  total: number;
  onKeywordsChange: (k: Partial<DatabaseSearchKeywords>) => void;
  onSettingClick: () => void;
  onStructureClick: ToolbarItemProps['onClick'];
  onDatabaseChange: (databaseKey: string) => void;
  onRemoveAll: () => void;
}

export function DatabaseSearchOptions(props: DatabaseSearchOptionsProps) {
  const {
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
    onRemoveAll,
  } = props;

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
    <>
      <PanelHeader
        onClickSettings={() => onSettingClick()}
        current={result.data.length}
        total={total || 0}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingBottom: '2px',
          }}
        >
          <ToolBarButton
            tooltip={`${showSimilarityTree ? 'Hide' : 'Show'} similarity tree`}
            icon={<TbBinaryTree />}
            active={showSimilarityTree}
            onClick={handleShowSimilarityTree}
          />

          <Select
            style={{ flex: 6, marginLeft: '5px' }}
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
        </div>
      </PanelHeader>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <ToolBarButton
          tooltip="Filter by select ranges"
          icon={<FaICursor />}
          active={selectedTool === options.databaseRangesSelection.id}
          onClick={enableFilterHandler}
        />

        <Input
          value={keywords.searchKeywords}
          renderIcon={() => <IoSearchOutline />}
          style={{ inputWrapper: { flex: 3, margin: '0 5px' } }}
          className="search-input"
          type="text"
          debounceTime={250}
          placeholder="Search for parameter..."
          onChange={handleSearch}
          onClear={clearHandler}
          canClear
        />

        <Toolbar>
          <Toolbar.Item
            tooltip="Search by substructure"
            icon={!idCode ? <BsHexagon /> : <BsHexagonFill />}
            intent="success"
            active={!!idCode}
            onClick={onStructureClick}
          />
          <Toolbar.Item
            tooltip="Remove all added spectra"
            icon={<FaRegTrashAlt />}
            intent="danger"
            onClick={onRemoveAll}
          />
        </Toolbar>
      </div>
    </>
  );
}
