/** @jsxImportSource @emotion/react */
import { Button, DialogBody, DialogFooter } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { v4 } from '@lukeed/uuid';
import { Formik } from 'formik';
import { Spectrum1D } from 'nmr-load-save';
import { Range, splitPatterns, translateMultiplet } from 'nmr-processing';
import { useMemo, useCallback, useRef } from 'react';
import { FaSearchPlus } from 'react-icons/fa';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { DialogProps } from '../../elements/DialogManager';
import { DraggableDialog } from '../../elements/DraggableDialog';
import FormikOnChange from '../../elements/formik/FormikOnChange';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useSpectrum from '../../hooks/useSpectrum';
import useEditRangeModal from '../../panels/RangesPanel/hooks/useEditRangeModal';
import { hasCouplingConstant } from '../../panels/extra/utilities/MultiplicityUtilities';
import { formatNumber } from '../../utility/formatNumber';

import SignalsContent from './forms/components/SignalsContent';
import editRangeFormValidation from './forms/validation/EditRangeValidation';

const styles = css`
  background-color: white;

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

interface Coupling {
  multiplicity: any;
  coupling: string | number;
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
  const formRef = useRef<any>(null);
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
          id: v4(),
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

  const handleOnSave = useCallback(
    (formValues) => {
      void (async () => {
        const _range = { ...range };
        _range.signals = getSignals(formValues.signals);
        await onSave(_range);
      })();
    },
    [getSignals, onSave, range],
  );

  const data = useMemo(() => {
    const signals = range?.signals.map((signal) => {
      // counter within j array to access to right j values

      let counterJ = 0;
      const couplings: Coupling[] = [];
      if (signal.multiplicity) {
        for (const multiplicity of splitPatterns(signal.multiplicity)) {
          let js: Coupling = {
            multiplicity,
            coupling: '',
          };
          if (hasCouplingConstant(multiplicity) && signal?.js.length > 0) {
            js = { ...signal.js[counterJ] } as Coupling;
            js.coupling = Number(
              formatNumber(js.coupling, rangesPreferences.coupling.format),
            );
            counterJ++;
          }
          js.multiplicity = translateMultiplet(js.multiplicity || multiplicity);
          couplings.push(js);
        }
      }
      return { ...signal, js: couplings };
    });
    return { activeTab: '0', signals };
  }, [range?.signals, rangesPreferences]);

  const changeHandler = useCallback(
    (values) => {
      const signals = getSignals(values.signals);

      if (
        JSON.stringify(range?.signals, (key, value) => {
          if (key !== 'id') return value;
        }) !==
        JSON.stringify(signals, (key, value) => {
          if (key !== 'id') return value;
        })
      ) {
        dispatch({
          type: 'UPDATE_RANGE',
          payload: { range: { ...range, signals } },
        });
      }
    },
    [dispatch, getSignals, range],
  );

  if (!rangesPreferences || !range) {
    return;
  }

  const title = ` Range and Signal edition: ${formatNumber(
    range?.from,
    rangesPreferences.from.format,
  )} ppm to ${formatNumber(range?.to, rangesPreferences.to.format)} ppm`;

  return (
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
      <DialogBody css={styles}>
        <Formik
          innerRef={formRef}
          initialValues={data}
          validationSchema={editRangeFormValidation}
          onSubmit={handleOnSave}
        >
          <>
            <SignalsContent range={range} />
            <FormikOnChange onChange={changeHandler} />
          </>
        </Formik>
      </DialogBody>
      <DialogFooter>
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button intent="success" onClick={() => formRef.current.submitForm()}>
            Save and Exit
          </Button>
        </div>
      </DialogFooter>
    </DraggableDialog>
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
