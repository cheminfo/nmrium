import { Switch, Button } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { Filter } from 'nmr-processing';
import { memo, useRef, useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ObjectInspector } from 'react-inspector';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useToaster } from '../../context/ToasterContext';
import { AlertButton, useAlert } from '../../elements/Alert';
import { Sections } from '../../elements/Sections';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus';
import useSpectrum from '../../hooks/useSpectrum';

const IconButton = styled(Button)`
  padding: 2px;
`;

interface FiltersProps extends Filter {
  error?: any;
}

interface FilterElementsProps {
  filter: Filter;
  isOpen: boolean;
  spectraCounter: number;
  onEnableChange: () => void;
}

function FilterElements(props: FilterElementsProps) {
  const dispatch = useDispatch();
  const alert = useAlert();
  const toaster = useToaster();
  const { filter, isOpen, spectraCounter, onEnableChange } = props;
  const { id, name, flag, label, isDeleteAllow } = filter;

  function handelFilterCheck(id, event: React.ChangeEvent<HTMLInputElement>) {
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

  function handelDeleteFilter() {
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
      {isOpen && (
        <>
          <IconButton
            icon="reset"
            minimal
            intent="warning"
            onClick={() => {
              // eslint-disable-next-line no-console
              console.log('Reset');
            }}
          />
          <IconButton
            icon="tick"
            minimal
            intent="success"
            onClick={() => {
              // eslint-disable-next-line no-console
              console.log('Save');
            }}
          />
        </>
      )}
      <IconButton
        intent="danger"
        minimal
        onClick={() => {
          handelDeleteFilter();
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
          handelFilterCheck(id, event);
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

  const [openSection, setOpenSection] = useState('');
  const dispatch = useDispatch();
  const toaster = useToaster();
  const selectedFilterIndex = useRef<number>();

  function toggleSection(sectionKey) {
    setOpenSection(openSection === sectionKey ? null : sectionKey);
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
      return { backgroundColor: '#8ad22f6e' };
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

  return (
    <Sections overflow>
      {filters.map((filter, index) => {
        const { id, label, error, value } = filter;
        return (
          <Sections.Item
            key={id}
            id={id}
            title={label}
            serial={index + 1}
            onClick={(id) => {
              toggleSection(id);
              filterSnapShotHandler(filter, index);
            }}
            selectedSectionId={openSection}
            rightElement={(isOpen) => (
              <FilterElements
                isOpen={isOpen}
                filter={filter}
                spectraCounter={spectraCounter}
                onEnableChange={() => setOpenSection('')}
              />
            )}
            headerStyle={getStyle(filter, index)}
          >
            <ObjectInspector data={error || value} />
          </Sections.Item>
        );
      })}
    </Sections>
  );
}

const emptyData = { filters: [] };

const MemoizedFilters = memo(FiltersInner);

export function Filters() {
  const {
    toolOptions: {
      data: { activeFilterID },
    },
  } = useChartData();
  const { filters } = useSpectrum(emptyData);
  const spectraCounter = useSpectraByActiveNucleus().length;

  return <MemoizedFilters {...{ filters, spectraCounter, activeFilterID }} />;
}
