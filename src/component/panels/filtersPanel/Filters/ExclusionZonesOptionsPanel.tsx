import { Classes } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'react-science/ui';
import * as Yup from 'yup';

import type { ExtractFilterEntry } from '../../../../data/types/common/ExtractFilterEntry.js';
import type { ExclusionZone } from '../../../../data/types/data1d/ExclusionZone.js';
import { useChartData } from '../../../context/ChartContext.js';
import { useDispatch } from '../../../context/DispatchContext.js';
import { NumberInput2Controller } from '../../../elements/NumberInput2Controller.js';
import type { Column } from '../../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../../elements/ReactTable/ReactTable.js';
import { ReadOnly } from '../../../elements/ReadOnly.js';
import { Sections } from '../../../elements/Sections.js';

import { FilterActionButtons } from './FilterActionButtons.js';
import { HeaderContainer, StickyHeader } from './InnerFilterHeader.js';

import type { BaseFilterOptionsPanelProps } from './index.js';

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
  props: BaseFilterOptionsPanelProps<ExtractFilterEntry<'exclusionZones'>>,
) {
  const { filter, enableEdit = true, onCancel, onConfirm } = props;
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

  function handleConfirm(event) {
    void handleSubmit(handleApplyFilter)();
    onConfirm?.(event);
  }

  function handleCancel(event) {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
    onCancel?.(event);
  }

  return (
    <ReadOnly enabled={!enableEdit}>
      {enableEdit && (
        <StickyHeader>
          <HeaderContainer>
            <div />
            <FilterActionButtons
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              disabledConfirm={!isDirty}
              disabledCancel={!isDirty}
            />
          </HeaderContainer>
        </StickyHeader>
      )}
      <Sections.Body>
        <ReactTable<ExclusionZone>
          columns={exclusionsZonesColumns}
          data={exclusionsZones}
          emptyDataRowText="No Zones"
        />
      </Sections.Body>
    </ReadOnly>
  );
}
