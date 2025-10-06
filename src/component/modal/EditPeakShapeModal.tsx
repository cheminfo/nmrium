import { Dialog, DialogFooter } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Peak1D } from '@zakodium/nmr-types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { useDispatch } from '../context/DispatchContext.js';
import ActionButtons from '../elements/ActionButtons.js';
import type { LabelStyle } from '../elements/Label.js';
import Label from '../elements/Label.js';
import { NumberInput2Controller } from '../elements/NumberInput2Controller.js';
import { Select2 } from '../elements/Select2.js';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';
import { useActiveNucleusTab } from '../hooks/useActiveNucleusTab.ts';
import { usePanelPreferences } from '../hooks/usePanelPreferences.js';
import { formatNumber } from '../utility/formatNumber.js';

type Shape = NonNullable<Peak1D['shape']>;

type Kind =
  | 'gaussian'
  | 'lorentzian'
  | 'pseudoVoigt'
  | 'generalizedLorentzian'
  | 'lorentzianDispersive';

function getKindDefaultValues(kind: Kind) {
  return {
    kind,
    fwhm: 500,
    ...(kind === 'pseudoVoigt'
      ? { mu: 0.5 }
      : kind === 'generalizedLorentzian' && { gamma: 0.5 }),
  };
}
function getValues(peak: Peak1D, kind: Kind): Shape {
  const { shape } = peak;
  const shapeData =
    (shape?.kind || '').toLocaleLowerCase() !== kind
      ? {
          ...getKindDefaultValues(kind),
          ...(shape?.fwhm && { fwhm: shape?.fwhm }),
        }
      : shape;

  return shapeData as Shape;
}

function validation(kind: Kind) {
  return Yup.object().shape({
    fwhm: Yup.number().required(),
    ...(kind === 'pseudoVoigt' && { mu: Yup.number().required() }),
  });
}

const KINDS: Array<{ label: string; value: Kind }> = [
  {
    value: 'gaussian',
    label: 'Gaussian',
  },
  {
    value: 'lorentzian',
    label: 'Lorentzian',
  },
  {
    value: 'pseudoVoigt',
    label: 'PseudoVoigt',
  },
  {
    value: 'generalizedLorentzian',
    label: 'Generalized Lorentzian',
  },
];

const labelStyle: LabelStyle = {
  container: { paddingTop: '5px' },
  label: { flex: 3, fontSize: '14px', fontWeight: 'normal' },
  wrapper: { flex: 7, display: 'flex' },
};

interface EditPeakShapeModalProps {
  onCloseDialog: () => void;
  peak?: Peak1D;
}

export function EditPeakShapeModal(props: EditPeakShapeModalProps) {
  const { peak, ...otherProps } = props;
  if (!peak) return;

  return <InnerEditPeakShapeModal peak={peak} {...otherProps} />;
}

function InnerEditPeakShapeModal(props: Required<EditPeakShapeModalProps>) {
  const { peak, onCloseDialog } = props;
  const dispatch = useDispatch();
  const activeTab = useActiveNucleusTab();
  const peaksPreferences = usePanelPreferences('peaks', activeTab);

  const [kind, setKind] = useState<Kind>(peak.shape?.kind || 'gaussian');
  const { handleSubmit, control, reset } = useForm<Shape>({
    defaultValues: getValues(peak, kind),
    resolver: yupResolver(validation(kind)) as any,
  });

  function changePeakShapeHandler(values) {
    dispatch({
      type: 'CHANGE_PEAK_SHAPE',
      payload: {
        id: peak.id,
        shape: {
          ...values,
        },
      },
    });
    onCloseDialog();
  }

  function handleChangeKind({ value }) {
    reset(getValues(peak, value));
    setKind(value);
  }

  const valuePPM = formatNumber(peak.x, peaksPreferences.deltaPPM.format);

  return (
    <Dialog
      isOpen
      style={{ width: 400 }}
      onClose={onCloseDialog}
      title={`Peak Shape Edition ( ${valuePPM} PPM )`}
    >
      <StyledDialogBody padding="1.5em 3em">
        <>
          <Label title="Kind:" style={labelStyle}>
            <Select2
              items={KINDS}
              selectedItemValue={kind}
              onItemSelect={handleChangeKind}
            />
          </Label>

          <Label title="FWHM:" style={labelStyle}>
            <NumberInput2Controller min={0} control={control} name="fwhm" />
          </Label>

          {kind === 'pseudoVoigt' && (
            <Label title="Mu:" style={labelStyle}>
              <NumberInput2Controller min={0} control={control} name="mu" />
            </Label>
          )}
          {kind === 'generalizedLorentzian' && (
            <Label title="Gamma:" style={labelStyle}>
              <NumberInput2Controller
                min={-1}
                max={2}
                control={control}
                name="gamma"
              />
            </Label>
          )}
        </>
      </StyledDialogBody>
      <DialogFooter>
        <ActionButtons
          style={{ flexDirection: 'row-reverse', margin: 0 }}
          onDone={() => handleSubmit(changePeakShapeHandler)()}
          doneLabel="Save"
          onCancel={() => onCloseDialog?.()}
        />
      </DialogFooter>
    </Dialog>
  );
}
