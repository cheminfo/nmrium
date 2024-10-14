import { Switch } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { v4 } from '@lukeed/uuid';
import { Filter, Filters } from 'nmr-processing';
import { memo, useEffect, useRef, useState } from 'react';
import { FaRegTrashAlt, FaRegEyeSlash } from 'react-icons/fa';
import { ObjectInspector } from 'react-inspector';
import { Button } from 'react-science/ui';

import { useChartData } from '../../../context/ChartContext';
import { useDispatch } from '../../../context/DispatchContext';
import { useToaster } from '../../../context/ToasterContext';
import { AlertButton, useAlert } from '../../../elements/Alert';
import { Sections } from '../../../elements/Sections';
import useSpectraByActiveNucleus from '../../../hooks/useSpectraPerNucleus';
import useSpectrum from '../../../hooks/useSpectrum';

import { filterOptionPanels } from './index';

const IconButton = styled(Button)`
  padding: 2px;
  font-size: 16px;
`;

interface FiltersProps extends Filter {
  error?: any;
}

interface FilterElementsProps {
  filter: Filter;
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
  const { id, name, flag, label, isDeleteAllow } = filter;

  function handleFilterCheck(id, event: React.ChangeEvent<HTMLInputElement>) {
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

  return (
    <>
      {!hideFilterRestoreButton && (
        <IconButton
          intent={activeFilterID === id ? 'danger' : 'success'}
          tooltipProps={{
            content:
              activeFilterID === id ? 'Reapply all filters' : 'Edit filter',
          }}
          minimal
          onClick={onFilterRestore}
          icon={activeFilterID === id ? 'undo' : 'history'}
        />
      )}
      <IconButton
        intent="danger"
        tooltipProps={{ content: 'Delete filter' }}
        minimal
        onClick={() => {
          handleDeleteFilter();
        }}
        disabled={!isDeleteAllow}
      >
        <FaRegTrashAlt />
      </IconButton>

      <Switch
        style={{ margin: 0, marginLeft: '5px' }}
        innerLabelChecked="On"
        innerLabel="Off"
        checked={flag || false}
        onChange={(event) => {
          handleFilterCheck(id, event);
        }}
      />
    </>
  );
}

interface FiltersInnerProps {
  filters: FiltersProps[];
  spectraCounter: number;
  activeFilterID: string | null;
}

function FiltersInner(props: FiltersInnerProps) {
  const { filters, spectraCounter, activeFilterID } = props;
  const {
    toolOptions: { selectedTool },
  } = useChartData();
  const [newFilter, setNewFilter] = useState<Filter | null>();

  const [selectedSection, openSection] = useState('');
  const dispatch = useDispatch();
  const toaster = useToaster();
  const selectedFilterIndex = useRef<number>();

  function toggleSection(sectionKey) {
    openSection(selectedSection === sectionKey ? null : sectionKey);
  }

  function filterSnapShotHandler(filter, index) {
    selectedFilterIndex.current =
      selectedFilterIndex.current && index === selectedFilterIndex.current
        ? null
        : index;
    const hideLoading = toaster.showLoading({
      message: 'Filter snapshot process in progress',
    });
    setTimeout(() => {
      dispatch({ type: 'SET_FILTER_SNAPSHOT', payload: filter });
      hideLoading();
    }, 0);
  }

  function getStyle(filter, index) {
    const { id } = filter;

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

  useEffect(() => {
    const isFilterExists = filters.some(
      (filter) => filter.name === selectedTool,
    );

    if (!isFilterExists && Filters?.[selectedTool]) {
      const { id: name, name: label } = Filters[selectedTool];
      setNewFilter({
        flag: true,
        id: v4(),
        name,
        label,
        value: null,
        isDeleteAllow: true,
      });
    } else {
      setNewFilter((previousNewFilter) => {
        if (previousNewFilter) {
          openSection('');
        }
        return null;
      });
    }

    if (Filters?.[selectedTool]) {
      openSection(selectedTool);
    }
  }, [filters, selectedTool]);

  const filtersList = [...filters];

  if (newFilter) {
    filtersList.push(newFilter);
  }

  if (filtersList?.length === 0) {
    return <EmptyFilters />;
  }

  function handleClose() {
    openSection('');
  }

  return (
    <Sections overflow renderActiveSectionContentOnly>
      {filtersList.map((filter, index) => {
        const { id, name, label, error, value } = filter;
        const FilterOptionsPanel = filterOptionPanels[filter.name];
        return (
          <Sections.Item
            key={id}
            id={name}
            title={label}
            serial={index + 1}
            onClick={(id) => {
              toggleSection(id);
            }}
            selectedSectionId={selectedSection}
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
                enableEdit={activeFilterID === id || filter.value === null}
                onCancel={handleClose}
                onConfirm={handleClose}
              />
            ) : (
              <Sections.Body>
                <ObjectInspector data={error || value} />
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

const EmptyContainer = styled.div`
  display: flex;
  justify-content: center;
  color: #6a6a6a;
  padding: 10px 0;
`;

export function EmptyFilters() {
  return (
    <EmptyContainer>
      <FaRegEyeSlash
        style={{
          margin: '0px 10px',
          fontSize: '16px',
        }}
      />
      <span
        style={{
          fontSize: '11px',
        }}
      >
        No Filters
      </span>
    </EmptyContainer>
  );
}
