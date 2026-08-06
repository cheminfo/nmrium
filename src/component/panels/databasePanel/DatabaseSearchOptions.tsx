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
import { ToolbarButton } from '../../elements/toolbar_button.tsx';
import useToolsFunctions from '../../hooks/useToolsFunctions.js';
import { options } from '../../toolbar/ToolTypes.js';

import type {
  DatabaseSearchKeywords,
  DatabaseSearchResultEntry,
  Databases,
} from './DatabasePanel.js';

interface DatabaseSearchOptionsProps {
  databases: Databases;
  defaultDatabase: string;
  keywords: DatabaseSearchKeywords;
  result: DatabaseSearchResultEntry;
  idCode?: string;
  total: number;
  availableNuclei: string[];
  selectedNucleus?: string;
  onKeywordsChange: (k: Partial<DatabaseSearchKeywords>) => void;
  onSettingClick: () => void;
  onStructureClick: ToolbarItemProps['onClick'];
  onDatabaseChange: (databaseKey: string) => void;
  onNucleiChange: (nucleus: string) => void;
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
    availableNuclei,
    selectedNucleus,
    onKeywordsChange,
    onSettingClick,
    onStructureClick,
    onDatabaseChange,
    onNucleiChange,
    onRemoveAll,
  } = props;

  const { handleChangeOption } = useToolsFunctions();
  const {
    view: {
      spectra: { showSimilarityTree, activeTab },
    },
    toolOptions: { selectedTool },
  } = useChartData();
  const dispatch = useDispatch();

  function enableFilterHandler() {
    const tool =
      selectedTool === options.databaseRangesSelection.id
        ? options.zoom.id
        : options.databaseRangesSelection.id;
    handleChangeOption(tool);
  }

  function handleSolventChange(value: string | number) {
    onKeywordsChange({ solvent: String(value) });
  }

  function handleKeywordsInputChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    onKeywordsChange({ searchKeywords: event.target.value });
  }

  function clearHandler() {
    onKeywordsChange({ searchKeywords: '' });
  }

  function handleShowSimilarityTree() {
    dispatch({ type: 'TOGGLE_SIMILARITY_TREE' });
  }

  const nucleusItems = availableNuclei.map((n) => ({ key: n, label: n }));

  return (
    <>
      <PanelHeader
        onClickSettings={onSettingClick}
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
          <ToolbarButton
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

          {!activeTab && nucleusItems.length > 0 && (
            <Select
              style={{ flex: 2, marginLeft: '5px' }}
              items={nucleusItems}
              itemTextField="label"
              itemValueField="key"
              onChange={onNucleiChange}
              value={selectedNucleus}
              placeholder="Select nucleus"
            />
          )}

          <Select
            style={{ flex: 4, margin: '0px 5px' }}
            items={result.solvents}
            placeholder="Solvent"
            onChange={handleSolventChange}
            value={keywords.solvent}
          />
        </div>
      </PanelHeader>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <ToolbarButton
          tooltip="Filter by select ranges"
          icon={<FaICursor />}
          active={selectedTool === options.databaseRangesSelection.id}
          onClick={() => enableFilterHandler()}
        />

        <Input
          value={keywords.searchKeywords}
          renderIcon={() => <IoSearchOutline />}
          style={{ inputWrapper: { flex: 3, margin: '0 5px' } }}
          className="search-input"
          type="text"
          debounceTime={250}
          placeholder="Search for parameter..."
          onChange={handleKeywordsInputChange}
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
