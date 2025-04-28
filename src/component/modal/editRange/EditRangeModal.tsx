import { Button, DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import { splitPatterns } from 'nmr-processing';
import type { Jcoupling, Range, Signal1D } from 'nmr-processing';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { FaSearchPlus } from 'react-icons/fa';

import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import type { DialogProps } from '../../elements/DialogManager.js';
import { DraggableDialog } from '../../elements/DraggableDialog.js';
import { StyledDialogBody } from '../../elements/StyledDialogBody.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import useEditRangeModal from '../../panels/RangesPanel/hooks/useEditRangeModal.js';
import { formatNumber } from '../../utility/formatNumber.js';

import SignalsContent from './forms/components/SignalsContent.js';
import editRangeFormValidation from './forms/validation/EditRangeValidation.js';
import { mapRange } from './utils/mapRange.js';

const DialogBody = styled(StyledDialogBody)`
  .tabs .tab-list {
    overflow-x: auto;
  }
`;

interface EditRangeModalProps {
  rangeID: string;
}

interface InnerEditRangeModalProps extends EditRangeModalProps {
  onSave: (value: any) => Promise<void> | null | void;
  onRest: (originalRange: Range) => void;
  onZoom: (value: any) => void;
}

export function EditRangeModal(props: DialogProps<string>) {
  const { reset, saveEditRange, zoomRange } = useEditRangeModal();
  const { dialogData: rangeID, onCloseDialog } = props;

  return (
    <InnerEditRangeModal
      onRest={(range) => {
        onCloseDialog();
        reset(range);
      }}
      onSave={(range) => {
        onCloseDialog();
        saveEditRange(range);
      }}
      onZoom={zoomRange}
      rangeID={rangeID}
    />
  );
}

function InnerEditRangeModal(props: InnerEditRangeModalProps) {
  const { onSave, onZoom, onRest, rangeID } = props;
  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const dispatch = useDispatch();
  const range = useRange(rangeID);
  const originalRangeRef = useRef(range);
  const rangesPreferences = usePanelPreferences('ranges', activeTab);

  function handleOnZoom() {
    onZoom(range);
  }

  function handleOnClose() {
    dispatch({
      type: 'SET_SELECTED_TOOL',
      payload: {
        selectedTool: 'zoom',
      },
    });
    onRest(mapRange(originalRangeRef.current));
  }

  const handleSave = useCallback(
    (formValues) => {
      void (async () => {
        const { signals } = formValues;
        await onSave(mapRange({ ...range, signals }));
      })();
    },
    [onSave, range],
  );

  const methods = useForm({
    defaultValues: range,
    resolver: yupResolver(editRangeFormValidation) as any,
  });

  const isDirtyRef = useRef<boolean>(true);

  useEffect(() => {
    isDirtyRef.current = false;
    methods.reset(range);
  }, [methods, range, rangesPreferences.coupling.format]);

  useEffect(() => {
    const { unsubscribe } = methods.watch(async (values) => {
      const isValid = await editRangeFormValidation.isValid(values);
      if (!isValid) return;
      if (isDirtyRef.current) {
        const range = mapRange(values as Range);

        dispatch({
          type: 'UPDATE_RANGE',
          payload: { range },
        });
      }

      isDirtyRef.current = true;
    });
    return () => unsubscribe();
  }, [dispatch, methods, methods.watch]);

  if (!rangesPreferences || !range) {
    return;
  }

  const title = ` Range and Signal edition: ${formatNumber(
    range?.from,
    rangesPreferences.from.format,
  )} ppm to ${formatNumber(range?.to, rangesPreferences.to.format)} ppm`;

  return (
    <FormProvider {...methods}>
      <DraggableDialog
        hasBackdrop={false}
        canOutsideClickClose={false}
        style={{ width: 700 }}
        title={title}
        isOpen
        headerLeftElement={
          <Button
            intent="success"
            style={{ marginRight: '5px', borderRadius: '5px' }}
            icon={
              <FaSearchPlus title="Set to default view on range in spectrum" />
            }
            variant="minimal"
            onClick={handleOnZoom}
          />
        }
        onClose={handleOnClose}
        placement="top-right"
      >
        <DialogBody>
          <SignalsContent range={range} />
        </DialogBody>
        <DialogFooter>
          <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
            <Button
              intent="success"
              onClick={() => methods.handleSubmit(handleSave)()}
            >
              Save and Exit
            </Button>
          </div>
        </DialogFooter>
      </DraggableDialog>
    </FormProvider>
  );
}

function useRange(rangeId: string) {
  const { ranges } = useSpectrum({
    ranges: { values: [] },
  }) as Spectrum1D;

  return useMemo(() => {
    const index = ranges.values.findIndex(
      (rangeRecord) => rangeRecord.id === rangeId,
    );
    return appendCouplings(ranges.values[index]);
  }, [rangeId, ranges.values]);
}

function appendCouplings(range: Range) {
  const signals: Signal1D[] = [];

  for (const signal of range?.signals || []) {
    const js: Jcoupling[] = [];
    if (!signal.multiplicity || !['s', 'm'].includes(signal.multiplicity)) {
      signals.push(signal);
      continue;
    }

    for (const multiplicity of splitPatterns(signal.multiplicity)) {
      js.push({
        multiplicity: multiplicity.value,
        coupling: '',
      } as unknown as Jcoupling);
    }

    signals.push({ ...signal, js });
  }

  return { ...range, signals };
}
