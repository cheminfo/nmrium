import { Classes } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import { Filter } from 'nmr-processing';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'react-science/ui';
import * as Yup from 'yup';

import { ExclusionZone } from '../../../../data/types/data1d/ExclusionZone';
import { useChartData } from '../../../context/ChartContext';
import { useDispatch } from '../../../context/DispatchContext';
import { NumberInput2Controller } from '../../../elements/NumberInput2Controller';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import { Sections } from '../../../elements/Sections';

import { FilterActionButtons } from './FilterActionButtons';
import { HeaderContainer, StickyHeader } from './InnerFilterHeader';

interface ExclusionZonesOptionsPanelProps {
  filter: Filter;
}

const validationSchema = (min: number, max: number) =>
  Yup.object().shape({
    zones: Yup.array()
      .of(
        Yup.object({
          id: Yup.string().required(),
          from: Yup.number().min(min).max(max).required(),
          to: Yup.number().min(min).max(max).required(),
        }),
      )
      .required(),
  });

export default function ExclusionZonesOptionsPanel(
  options: ExclusionZonesOptionsPanelProps,
) {
  const { filter } = options;
  const dispatch = useDispatch();
  const {
    originDomain: {
      xDomain: [min, max],
    },
  } = useChartData();
  const {
    handleSubmit,
    setValue,
    control,
    reset,
    getValues,
    formState: { isDirty },
  } = useForm<{ zones: ExclusionZone[] }>({
    defaultValues: { zones: [] },
    resolver: yupResolver(validationSchema(min, max)),
  });

  const exclusionsZones = useWatch({
    name: 'zones',
    control,
    defaultValue: [],
  });

  useEffect(() => {
    if (Array.isArray(filter.value)) {
      reset({ zones: filter.value });
    }
  }, [filter.value, reset]);

  const handleDelete = useCallback(
    (index) => {
      setValue(
        'zones',
        getValues('zones').filter((_, i) => i !== index),
      );
    },
    [getValues, setValue],
  );

  const exclusionsZonesColumns: Array<Column<ExclusionZone>> = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '30px' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'from',
        Cell: ({ row }) => (
          <NumberInput2Controller
            control={control}
            name={`zones.${row.index}.from`}
            fill
            noShadowBox
            style={{ backgroundColor: 'transparent' }}
          />
        ),
      },
      {
        Header: 'To',
        Cell: ({ row }) => (
          <NumberInput2Controller
            control={control}
            name={`zones.${row.index}.to`}
            fill
            noShadowBox
            style={{ backgroundColor: 'transparent' }}
          />
        ),
      },

      {
        Header: '',
        style: { width: '30px' },
        id: 'actions',
        Cell: ({ row }) => {
          return (
            <Button
              small
              outlined
              intent="danger"
              onClick={() => handleDelete(row.index)}
            >
              <FaRegTrashAlt className={Classes.ICON} />
            </Button>
          );
        },
      },
    ],
    [control, handleDelete],
  );

  function handleApplyFilter(values) {
    dispatch({
      type: 'APPLY_EXCLUSION_ZONE',
      payload: values,
    });
  }

  function handleCancelFilter() {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
  }

  return (
    <>
      <StickyHeader>
        <HeaderContainer>
          <div />
          <FilterActionButtons
            onConfirm={() => handleSubmit(handleApplyFilter)()}
            onCancel={handleCancelFilter}
            disabledConfirm={!isDirty}
            disabledCancel={!isDirty}
          />
        </HeaderContainer>
      </StickyHeader>
      <Sections.Body>
        <ReactTable<ExclusionZone>
          columns={exclusionsZonesColumns}
          data={exclusionsZones}
          emptyDataRowText="No Zones"
        />
      </Sections.Body>
    </>
  );
}
