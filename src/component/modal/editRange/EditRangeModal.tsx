/** @jsxImportSource @emotion/react */
import { Button, DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Spectrum1D } from 'nmr-load-save';
import type { Jcoupling, Range, Signal1D } from 'nmr-processing';
import { splitPatterns, translateMultiplet } from 'nmr-processing';
import { useCallback, useEffect, useRef } from 'react';
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
import { hasCouplingConstant } from '../../panels/extra/utilities/MultiplicityUtilities.js';
import { formatNumber } from '../../utility/formatNumber.js';

import SignalsContent from './forms/components/SignalsContent.js';
import editRangeFormValidation from './forms/validation/EditRangeValidation.js';

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

// interface Coupling {
//   multiplicity: any;
//   coupling: string | number;
// }

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
    onRest(originalRangeRef.current);
  }

  const getCouplings = useCallback(
    (couplings) =>
      couplings
        .filter((coupling) => coupling.coupling !== '')
        .map((coupling) => {
          return {
            ...coupling,
            multiplicity: translateMultiplet(coupling.multiplicity),
          };
        }),
    [],
  );

  const getSignals = useCallback(
    (signals) => {
      return signals.map((signal) => {
        return {
          id: crypto.randomUUID(),
          ...signal,
          multiplicity: signal.js
            .map((_coupling) => translateMultiplet(_coupling.multiplicity))
            .join(''),
          js: getCouplings(signal?.js || []),
        };
      });
    },
    [getCouplings],
  );

  const handleSave = useCallback(
    (formValues) => {
      void (async () => {
        const _range = { ...range };
        _range.signals = getSignals(formValues.signals);
        await onSave(_range);
      })();
    },
    [getSignals, onSave, range],
  );

  const methods = useForm({
    defaultValues: mapData(range, {
      couplingFormat: rangesPreferences.coupling.format,
    }),
    resolver: yupResolver(editRangeFormValidation) as any,
  });

  const isDirtyRef = useRef<boolean>(true);

  useEffect(() => {
    isDirtyRef.current = false;
    methods.reset(
      mapData(range, { couplingFormat: rangesPreferences.coupling.format }),
    );
  }, [methods, range, rangesPreferences.coupling.format]);

  useEffect(() => {
    const { unsubscribe } = methods.watch(async (values) => {
      const isValid = await editRangeFormValidation.isValid(values);
      if (!isValid) return;
      if (isDirtyRef.current) {
        const signals = getSignals(values.signals);

        dispatch({
          type: 'UPDATE_RANGE',
          payload: { range: { ...values, signals } as Range },
        });
      }

      isDirtyRef.current = true;
    });
    return () => unsubscribe();
  }, [dispatch, getSignals, methods, methods.watch]);

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
            minimal
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

  const index = ranges.values.findIndex(
    (rangeRecord) => rangeRecord.id === rangeId,
  );
  return ranges.values[index];
}

interface MapDataOptions {
  couplingFormat: string;
}

function mapData(range: Range, options: MapDataOptions) {
  const { couplingFormat } = options;

  const signals: Signal1D[] = [];

  for (const signal of range?.signals || []) {
    let counterJ = 0;
    const couplings: Array<
      Partial<Pick<Jcoupling, 'coupling' | 'multiplicity'>>
    > = [];

    if (!signal.multiplicity) {
      signals.push(signal);
      continue;
    }

    for (const multiplicity of splitPatterns(signal.multiplicity)) {
      const js = { ...signal.js[counterJ] };

      if (hasCouplingConstant(multiplicity) && signal?.js.length > 0) {
        const coupling = Number(formatNumber(js.coupling, couplingFormat));
        js.coupling = coupling;
        counterJ++;
      }
      js.multiplicity = translateMultiplet(js.multiplicity || multiplicity);
      couplings.push(js);
    }

    signals.push({ ...signal, js: couplings as Jcoupling[] });
  }
  return { ...range, activeTab: '0', signals };
}
