import { DialogFooter } from '@blueprintjs/core';
import { revalidateLogic } from '@tanstack/react-form';
import type { Peak1D } from '@zakodium/nmr-types';
import { assertNotNullish } from '@zakodium/utils';
import { AppForm, Button, coerceNumberInput, useForm } from 'react-science/ui';
import { match } from 'ts-pattern';
import { z } from 'zod';

import { useDispatch } from '../context/DispatchContext.js';
import { StandardDialog } from '../elements/StandardDialog.tsx';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';
import { useActiveNucleusTab } from '../hooks/useActiveNucleusTab.js';
import { usePanelPreferences } from '../hooks/usePanelPreferences.js';
import { formatNumber } from '../utility/formatNumber.js';

type Shape = NonNullable<Peak1D['shape']>;
type Kind = Shape['kind'];

export const PEAKS_SHAPES: Array<{ label: string; value: Kind }> = [
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

const sharedFieldsValidation = {
  fwhm: coerceNumberInput(z.number().min(0)),
};

const otherShapeValuesValidation = PEAKS_SHAPES.map(
  (shape) => shape.value,
).filter(
  (value) => value !== 'pseudoVoigt' && value !== 'generalizedLorentzian',
);

const baseZodValidation = z.object({
  ...sharedFieldsValidation,
  kind: z.enum(otherShapeValuesValidation),
});

const muZodValidation = z.object({
  ...sharedFieldsValidation,
  kind: z.literal('pseudoVoigt'),
  mu: coerceNumberInput(),
});

const gammaZodValidation = z.object({
  ...sharedFieldsValidation,
  kind: z.literal('generalizedLorentzian'),
  gamma: coerceNumberInput(z.number().min(-1).max(2)),
});

const zodValidation = z.discriminatedUnion('kind', [
  baseZodValidation,
  muZodValidation,
  gammaZodValidation,
]);

function shapeToForm(shape: Shape): z.input<typeof zodValidation> {
  if (shape.kind === 'pseudoVoigt') {
    return {
      kind: 'pseudoVoigt',
      fwhm: shape.fwhm?.toString() || '500',
      mu: shape.mu?.toString() || '0.5',
    };
  }

  if (shape.kind === 'generalizedLorentzian') {
    return {
      kind: 'generalizedLorentzian',
      fwhm: shape.fwhm?.toString() || '500',
      gamma: shape.gamma?.toString() || '0.5',
    };
  }

  return {
    kind: shape.kind,
    fwhm: shape.fwhm?.toString() || '500',
  };
}

function getValues(peak: Peak1D, kind: Kind): z.input<typeof zodValidation> {
  const { shape } = peak;
  assertNotNullish(shape);

  if ((shape?.kind || '').toLocaleLowerCase() !== kind) {
    const defaults = getDefaultValues(kind);

    return shape?.fwhm !== undefined
      ? { ...defaults, fwhm: shape.fwhm.toString() }
      : defaults;
  }

  return shapeToForm(shape);
}

interface EditPeakShapeModalProps {
  onCloseDialog: () => void;
  peak?: Peak1D;
}

export function EditPeakShapeModal(props: EditPeakShapeModalProps) {
  const { peak, ...otherProps } = props;
  if (!peak) return;

  return <InnerEditPeakShapeModal peak={peak} {...otherProps} />;
}

function getDefaultValues(
  shapeKind: Kind = 'gaussian',
): z.input<typeof zodValidation> {
  if (shapeKind === 'pseudoVoigt') {
    return {
      kind: 'pseudoVoigt',
      fwhm: '500',
      mu: '0.5',
    };
  }

  if (shapeKind === 'generalizedLorentzian') {
    return {
      kind: 'generalizedLorentzian',
      fwhm: '500',
      gamma: '0.5',
    };
  }

  return {
    kind: shapeKind,
    fwhm: '500',
  };
}

function InnerEditPeakShapeModal(props: Required<EditPeakShapeModalProps>) {
  const { peak, onCloseDialog } = props;
  const dispatch = useDispatch();
  const activeTab = useActiveNucleusTab();
  const { tablePreferences } = usePanelPreferences('peaks', activeTab);
  const initialKind = peak.shape?.kind || 'gaussian';

  const form = useForm({
    defaultValues: getValues(peak, initialKind),
    validationLogic: revalidateLogic({ mode: 'change' }),
    validators: {
      onDynamic: zodValidation,
    },
    onSubmitMeta: {
      applyToAll: false,
    },
    onSubmit: ({ value, meta }) => {
      const { applyToAll } = meta;
      const shape = zodValidation.parse(value);

      dispatch({
        type: 'CHANGE_PEAK_SHAPE',
        payload: {
          id: !applyToAll ? peak.id : undefined,
          shape,
        },
      });

      onCloseDialog();
    },
  });

  const valuePPM = formatNumber(peak.x, tablePreferences.deltaPPM.format);

  return (
    <StandardDialog
      isOpen
      style={{ width: 400 }}
      onClose={onCloseDialog}
      title={`Peak Shape Edition ( ${valuePPM} PPM )`}
    >
      <AppForm form={form} layout="inline">
        <StyledDialogBody padding="1.5em 3em">
          <form.AppField
            name="kind"
            listeners={{
              onChange: ({ value }) => {
                form.reset(getValues(peak, value));
              },
            }}
          >
            {(field) => (
              <>
                <field.Select label="Kind" items={PEAKS_SHAPES} />

                <form.AppField name="fwhm">
                  {(field) => <field.NumericInput label="FWHM" min={0} />}
                </form.AppField>

                {match(field.state.value)
                  .with('pseudoVoigt', () => (
                    <form.AppField name="mu">
                      {(field) => <field.NumericInput label="Mu" min={0} />}
                    </form.AppField>
                  ))
                  .with('generalizedLorentzian', () => (
                    <form.AppField name="gamma">
                      {(field) => (
                        <field.NumericInput label="Gamma" min={-1} max={2} />
                      )}
                    </form.AppField>
                  ))
                  .otherwise(() => null)}
              </>
            )}
          </form.AppField>
        </StyledDialogBody>
        <DialogFooter
          actions={
            <>
              <Button
                variant="outlined"
                intent="danger"
                onClick={() => onCloseDialog?.()}
              >
                Cancel
              </Button>
              <Button
                intent="primary"
                onClick={() => form.handleSubmit({ applyToAll: false })}
              >
                Apply
              </Button>
              <Button
                intent="success"
                data-action="apply"
                onClick={() => form.handleSubmit({ applyToAll: true })}
              >
                Apply to all
              </Button>
            </>
          }
        />
      </AppForm>
    </StandardDialog>
  );
}
