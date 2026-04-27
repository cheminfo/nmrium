import { Switch } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { Filters1D, Filters2D } from 'nmr-processing';
import type { ChangeEvent } from 'react';
import { memo, useMemo, useRef, useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ObjectInspector } from 'react-inspector';
import { Button } from 'react-science/ui';

import { getFilterLabel } from '../../../../data/getFilterLabel.js';
import type { FilterEntry } from '../../../../data/types/common/FilterEntry.js';
import { useChartData } from '../../../context/ChartContext.js';
import { useDispatch } from '../../../context/DispatchContext.js';
import { useFilterSyncOptions } from '../../../context/FilterSyncOptionsContext.js';
import { useToaster } from '../../../context/ToasterContext.js';
import type { AlertButton } from '../../../elements/Alert.js';
import { useAlert } from '../../../elements/Alert.js';
import { EmptyText } from '../../../elements/EmptyText.js';
import { Sections } from '../../../elements/Sections.js';
import { useActiveSpectrum } from '../../../hooks/useActiveSpectrum.js';
import useSpectraByActiveNucleus from '../../../hooks/useSpectraPerNucleus.js';
import useSpectrum from '../../../hooks/useSpectrum.js';
import { getDefaultFilterOptions } from '../../../utility/getDefaultFilterOptions.js';

import { filterOptionPanels } from './index.js';

export const nonRemovableFilters = new Set<FilterEntry['name']>([
  'digitalFilter',
  'digitalFilter2D',
]);
const readOnlyFilters = new Set<FilterEntry['name']>([
  'digitalFilter',
  'shiftX',
  'exclusionZones',
  'fft',
  'digitalFilter2D',
  'fftDimension1',
  'fftDimension2',
]);

const IconButton = styled(Button)`
  font-size: 16px;
  padding: 2px;
`;

const Filters = {
  ...Filters1D,
  ...Filters2D,
};
interface FilterElementsProps {
  filter: FilterEntry;
  spectraCounter: number;
  onEnableChange: () => void;
  onFilterRestore: () => void;
  activeFilterID: string | null;
  hideFilterRestoreButton?: boolean;
}

function FilterElements(props: FilterElementsProps) {
  const dispatch = useDispatch();
  const alert = useAlert();
  const toaster = useToaster();
  const {
    filter,
    spectraCounter,
    onEnableChange,
    activeFilterID,
    onFilterRestore,
    hideFilterRestoreButton = false,
  } = props;
  const { id, name, enabled } = filter;
  const label = getFilterLabel(name);

  function handleFilterCheck(id: string, event: ChangeEvent<HTMLInputElement>) {
    const enabled = event.target.checked;
    const hideLoading = toaster.showLoading({
      message: `${enabled ? 'Enable' : 'Disable'} filter in progress`,
    });
    setTimeout(() => {
      dispatch({ type: 'ENABLE_FILTER', payload: { id, enabled } });
      hideLoading();
    }, 0);
    onEnableChange();
  }

  function handleDeleteFilter() {
    const buttons: AlertButton[] = [
      {
        text: 'Yes',
        onClick: async () => {
          const hideLoading = await toaster.showAsyncLoading({
            message: 'Delete filter process in progress',
          });
          dispatch({ type: 'DELETE_FILTER', payload: { id } });
          hideLoading();
        },
        intent: 'danger',
      },
      { text: 'No' },
    ];

    if (spectraCounter > 1) {
      buttons.unshift({
        text: 'Yes, for all spectra',
        onClick: async () => {
          const hideLoading = await toaster.showAsyncLoading({
            message: 'Delete all spectra filter process in progress',
          });
          dispatch({
            type: 'DELETE_SPECTRA_FILTER',
            payload: { filterName: name },
          });
          hideLoading();
        },
        intent: spectraCounter ? 'danger' : 'none',
      });
    }

    alert.showAlert({
      message: (
        <span>
          You are about to delete this processing step
          <span style={{ color: 'black' }}> {label} </span> , Are you sure?
        </span>
      ),
      buttons,
    });
  }

  const isEditable =
    !hideFilterRestoreButton &&
    activeFilterID !== id &&
    !readOnlyFilters.has(name);

  return (
    <>
      {isEditable && (
        <IconButton
          intent="success"
          tooltipProps={{
            content: 'Edit filter',
          }}
          variant="minimal"
          onClick={onFilterRestore}
          icon="annotation"
        />
      )}
      <IconButton
        intent="danger"
        tooltipProps={{ content: 'Delete filter' }}
        variant="minimal"
        onClick={() => {
          handleDeleteFilter();
        }}
        disabled={nonRemovableFilters.has(name)}
      >
        <FaRegTrashAlt />
      </IconButton>

      <Switch
        style={{ margin: 0, marginLeft: '5px' }}
        innerLabelChecked="On"
        innerLabel="Off"
        checked={enabled || false}
        onChange={(event) => {
          if (!id) return;
          handleFilterCheck(id, event);
        }}
      />
    </>
  );
}

interface FiltersInnerProps {
  filters: FilterEntry[];
  spectraCounter: number;
  activeFilterID: string | null;
}

function FiltersInner(props: FiltersInnerProps) {
  const { filters, spectraCounter, activeFilterID } = props;
  const {
    toolOptions: { selectedTool },
  } = useChartData();
  const [manualSection, setManualSection] = useState<string | null>(null);

  const { updateFilterOptions } = useFilterSyncOptions();

  const dispatch = useDispatch();
  const toaster = useToaster();
  const selectedFilterIndex = useRef<number | null>();
  const activeSpectrum = useActiveSpectrum();

  function filterSnapShotHandler(filter: FilterEntry, index: number) {
    selectedFilterIndex.current =
      selectedFilterIndex.current && index === selectedFilterIndex.current
        ? null
        : index;

    if (activeFilterID) {
      //Clear the filter sync object
      updateFilterOptions(null);
      //Close the opened section
      setManualSection(null);
    }
    const hideLoading = toaster.showLoading({
      message: 'Filter snapshot process in progress',
    });
    setTimeout(() => {
      dispatch({
        type: 'SET_FILTER_SNAPSHOT',
        payload: { filter, tempRollback: false },
      });
      hideLoading();
    }, 0);
  }

  function getStyle(filter: FilterEntry, index: number) {
    const { id, error } = filter;

    if (error) {
      return { backgroundColor: '#ea8f8f' };
    }
    if (activeFilterID === id) {
      return { backgroundColor: '#c2ea8f' };
    }

    if (
      activeFilterID &&
      selectedFilterIndex.current != null &&
      index > selectedFilterIndex.current
    ) {
      return { opacity: 0.5 };
    }

    return {};
  }

  const newFilter = useMemo<FilterEntry | null>(() => {
    const isFilterExists = filters.some((f) => f.name === selectedTool);
    if (!isFilterExists && (Filters as any)?.[selectedTool]) {
      const { name } = (Filters as any)[selectedTool];
      return getDefaultFilterOptions(name);
    }
    return null;
  }, [filters, selectedTool]);

  const selectedSection = useMemo(() => {
    // New filter tool is selected
    if ((Filters as any)?.[selectedTool]) return selectedTool;

    //An existing filter is being edited
    const filter = filters.find((f) => f.id === activeFilterID);
    if (filter) return filter.name;

    // otherwise, fallback to the manual selected section
    return manualSection;
  }, [selectedTool, activeFilterID, filters, manualSection]);

  function toggleSection(sectionKey: string) {
    setManualSection((prev) => (prev === sectionKey ? null : sectionKey));
  }

  function handleClose() {
    setManualSection(null);
  }

  const filtersList = [...filters];

  if (newFilter && activeSpectrum) {
    const activeFilterIndex = filters.findIndex(
      (filter) => filter.id === activeFilterID,
    );
    if (activeFilterIndex === -1) {
      filtersList.push(newFilter);
    } else {
      filtersList.splice(activeFilterIndex + 1, 0, newFilter);
    }
  }

  if (filtersList?.length === 0) {
    return <EmptyText text="No Filters" />;
  }

  function handleReorderFilters(sourceIndex: number, targetIndex: number) {
    dispatch({
      type: 'REORDER_FILTERS',
      payload: { sourceIndex, targetIndex },
    });
  }

  return (
    <Sections isOverflow renderActiveSectionContentOnly>
      {filtersList.map((filter, index) => {
        const { id, name, error, value } = filter;
        const FilterOptionsPanel = filterOptionPanels[name];
        const enableEdit = activeFilterID === id || value === null;
        return (
          <Sections.Item
            index={index}
            key={id}
            id={name}
            dragLabel={getFilterLabel(name)}
            onReorder={handleReorderFilters}
            title={error || getFilterLabel(name)}
            serial={index + 1}
            onClick={(id: string) => {
              toggleSection(id);
            }}
            isOpen={name === selectedSection}
            rightElement={
              <FilterElements
                filter={filter}
                spectraCounter={spectraCounter}
                onEnableChange={handleClose}
                activeFilterID={activeFilterID}
                onFilterRestore={() => {
                  filterSnapShotHandler(filter, index);
                }}
                /** Hide filter restore button when the filter is new */
                hideFilterRestoreButton={value === null}
              />
            }
            headerStyle={getStyle(filter, index)}
            sticky
          >
            {FilterOptionsPanel ? (
              <FilterOptionsPanel
                filter={filter}
                // Enable editing if the current filter is new or if it is the active filter
                enableEdit={enableEdit}
                onCancel={handleClose}
                onConfirm={handleClose}
                onEditStart={() => filterSnapShotHandler(filter, index)}
              />
            ) : (
              <Sections.Body>
                {value && Object.keys(value).length > 0 ? (
                  <ObjectInspector data={value} />
                ) : (
                  <EmptyText text=" No options available" />
                )}
              </Sections.Body>
            )}
          </Sections.Item>
        );
      })}
    </Sections>
  );
}

const emptyData = { filters: [] };

const MemoizedFilters = memo(FiltersInner);

export function FiltersSectionsPanel() {
  const {
    toolOptions: {
      data: { activeFilterID },
    },
  } = useChartData();
  const { filters } = useSpectrum(emptyData);
  const spectraCounter = useSpectraByActiveNucleus().length;

  return <MemoizedFilters {...{ filters, spectraCounter, activeFilterID }} />;
}
