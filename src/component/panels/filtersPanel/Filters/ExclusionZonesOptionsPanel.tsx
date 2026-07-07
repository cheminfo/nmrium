import { Classes } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import type { MouseEvent } from 'react';
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
import { ReadOnly } from '../../../elements/ReadOnly.js';
import { Sections } from '../../../elements/Sections.js';
import type { TanStackTableColumn } from '../../../elements/TanStackTable/TanStackTable.js';
import TanStackTable from '../../../elements/TanStackTable/TanStackTable.js';

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
  const { filter, enableEdit = true, onCancel, onConfirm, onEditStart } = props;
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
    (index: number) => {
      setValue(
        'zones',
        getValues('zones').filter((_, i) => i !== index),
        { shouldDirty: true },
      );
    },
    [getValues, setValue],
  );

  const exclusionsZonesColumns = useMemo<
    Array<TanStackTableColumn<ExclusionZone>>
  >(
    () => [
      {
        header: '#',
        meta: { style: { width: '30px' } },
        accessorFn: (_, index) => index + 1,
      },
      {
        header: 'from',
        cell: ({ row }) => (
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
        header: 'To',
        cell: ({ row }) => (
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
        header: '',
        meta: { style: { width: '30px' } },
        id: 'actions',
        cell: ({ row }) => {
          return (
            <Button
              size="small"
              variant="outlined"
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

  function handleApplyFilter(values: any) {
    dispatch({
      type: 'APPLY_EXCLUSION_ZONE',
      payload: values,
    });
  }

  function handleConfirm(event: MouseEvent<HTMLElement>) {
    void handleSubmit(handleApplyFilter)();
    onConfirm?.(event);
  }

  function handleCancel(event: MouseEvent<HTMLElement>) {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
    onCancel?.(event);
  }

  return (
    <ReadOnly enabled={!enableEdit} onClick={onEditStart}>
      {enableEdit && (
        <StickyHeader>
          <HeaderContainer>
            <div />
            <FilterActionButtons
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              disabledConfirm={!isDirty}
            />
          </HeaderContainer>
        </StickyHeader>
      )}
      <Sections.Body>
        <TanStackTable
          columns={exclusionsZonesColumns}
          data={exclusionsZones}
          emptyDataRowText="No Zones"
        />
      </Sections.Body>
    </ReadOnly>
  );
}
