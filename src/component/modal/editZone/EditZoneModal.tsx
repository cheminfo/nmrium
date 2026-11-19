import { Button, Colors, DialogFooter, Tag } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { revalidateLogic } from '@tanstack/react-form';
import type { Signal2D } from '@zakodium/nmr-types';
import { noop } from '@zakodium/utils';
import { AppForm, useForm, withForm } from 'react-science/ui';

import DefaultPathLengths from '../../../data/constants/DefaultPathLengths.js';
import type { DialogProps } from '../../elements/DialogManager.js';
import { DraggableDialog } from '../../elements/DraggableDialog.js';
import { StyledDialogBody } from '../../elements/StyledDialogBody.js';
import type { ZoneData } from '../../panels/ZonesPanel/hooks/useMapZones.js';
import { useZoneActions } from '../../panels/ZonesPanel/hooks/useZoneActions.js';

import { SignalsForm } from './SignalsForm.js';
import { isDefaultPathLength } from './validation/isDefaultPathLength.js';
import type { FormData, ZoneSignal } from './zoneForm.js';
import { defaultZoneFormValues, zoneFormSchema } from './zoneForm.js';

export function EditZoneModal(props: DialogProps<ZoneData>) {
  const { dialogData: zone, onCloseDialog } = props;
  const { saveZone, zoomToZone } = useZoneActions();

  function handleSave(values: FormData) {
    const value = zoneFormSchema.parse(values);
    saveZone({
      ...zone,
      signals: mapSignalsBeforeSave(
        value.signals,
        zone.tableMetaInfo.experiment,
      ),
    });
    onCloseDialog();
  }

  const form = useForm({
    defaultValues: {
      signals: getSignalFormValues(zone),
    },
    validators: { onDynamic: zoneFormSchema },
    validationLogic: revalidateLogic({ mode: 'change' }),
    onSubmit: ({ value }) => handleSave(value),
  });

  return (
    <DraggableDialog
      hasBackdrop={false}
      canOutsideClickClose={false}
      style={{ width: 820, paddingBottom: 0 }}
      title="Edit zone signals"
      icon="properties"
      isOpen
      onClose={onCloseDialog}
      placement="top-right"
    >
      <AppForm form={form}>
        <DialogBody>
          <ZoneSummaryContent zone={zone} onZoom={() => zoomToZone(zone)} />
          <SignalsForm form={form} zone={zone} />
        </DialogBody>
        <ZoneEditorFooter form={form} onCancel={onCloseDialog} />
      </AppForm>
    </DraggableDialog>
  );
}

function ZoneSummaryContent({
  zone,
  onZoom,
}: {
  zone: ZoneData;
  onZoom: () => void;
}) {
  return (
    <ZoneSummary aria-label="Zone boundaries">
      <ZoneSummaryHeading>
        <strong>Selected zone</strong>
        {zone.tableMetaInfo.experiment && (
          <Tag minimal>{zone.tableMetaInfo.experiment.toUpperCase()}</Tag>
        )}
      </ZoneSummaryHeading>
      <ZoneBoundaries>
        {(['x', 'y'] as const).map((axis) => (
          <ZoneBoundary key={axis}>
            <ZoneAxis>{axis === 'x' ? 'F2' : 'F1'}</ZoneAxis>
            <ZoneRange>
              {Math.min(zone[axis].from, zone[axis].to).toFixed(2)}
              {Math.max(zone[axis].from, zone[axis].to).toFixed(2)}
              <ZoneUnit>ppm</ZoneUnit>
            </ZoneRange>
          </ZoneBoundary>
        ))}
      </ZoneBoundaries>
      <ZoomToZoneButton icon="zoom-in" variant="minimal" onClick={onZoom}>
        Zoom to zone
      </ZoomToZoneButton>
    </ZoneSummary>
  );
}

const ZoneEditorFooter = withForm({
  defaultValues: defaultZoneFormValues,
  validators: { onDynamic: zoneFormSchema },
  props: { onCancel: noop },
  render: ({ form, onCancel }) => {
    return (
      <DialogFooter
        actions={
          <>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => ({
                isDefaultValue: state.isDefaultValue,
                isValid: state.isValid,
              })}
            >
              {({ isDefaultValue, isValid }) => (
                <form.SubmitButton
                  intent={
                    !isValid ? 'danger' : isDefaultValue ? 'none' : 'success'
                  }
                  disabled={isDefaultValue}
                >
                  Save changes
                </form.SubmitButton>
              )}
            </form.Subscribe>
          </>
        }
      >
        <form.Subscribe selector={(state) => state.isDefaultValue}>
          {(isDefaultValue) => (
            <SaveStatus role="status">
              <StatusDot aria-hidden="true" isDirty={!isDefaultValue} />
              {isDefaultValue ? 'No changes' : 'Unsaved changes'}
            </SaveStatus>
          )}
        </form.Subscribe>
      </DialogFooter>
    );
  },
});

const DialogBody = styled(StyledDialogBody)`
  padding: 20px;
`;

const ZoneSummary = styled.section`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 24px;
  padding: 12px 16px;
  margin-bottom: 24px;
  background: #f6f7f9;
  border: 1px solid #e5e8eb;
  border-radius: 6px;
`;

const ZoneSummaryHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ZoneBoundaries = styled.dl`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin: 0;
  font-variant-numeric: tabular-nums;
`;

const ZoneBoundary = styled.div`
  display: flex;
  gap: 8px;
`;

const ZoneAxis = styled.dt`
  color: #5f6b7c;
`;

const ZoneRange = styled.dd`
  margin: 0;
`;

const ZoneUnit = styled.span`
  color: #5f6b7c;
  margin-left: 4px;
  font-size: 12px;
`;

const ZoomToZoneButton = styled(Button)`
  margin-left: auto;
`;

const SaveStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #5f6b7c;
  font-size: 12px;
`;

const StatusDot = styled.span<{ isDirty: boolean }>`
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: ${({ isDirty }) =>
    isDirty ? Colors.ORANGE3 : Colors.GREEN3};
`;

function mapSignalsBeforeSave(signals: ZoneSignal[], experiment?: string) {
  const outputSignals: Signal2D[] = [];

  for (const signal of signals) {
    const mappedSignal: Signal2D = { ...signal, j: { ...signal.j } };
    if (experiment && isDefaultPathLength(signal.j.pathLength, experiment)) {
      delete mappedSignal.j?.pathLength;
      if (mappedSignal.j && Object.keys(mappedSignal.j).length === 0) {
        delete mappedSignal.j;
      }
    }
    outputSignals.push(mappedSignal);
  }

  return outputSignals;
}
function getSignalFormValues(zone: ZoneData): FormData['signals'] {
  const {
    signals,
    tableMetaInfo: { experiment },
  } = zone;
  const { from = 1, to = 1 } = experiment
    ? DefaultPathLengths?.[experiment] || {}
    : {};

  return signals.map((signal) => {
    const pathLength = signal.j?.pathLength;
    const normalizedPathLength =
      typeof pathLength === 'number'
        ? { from: pathLength, to: pathLength }
        : (pathLength ?? { from, to });

    return {
      ...signal,
      kind: signal.kind ?? 'signal',
      x: { ...signal.x },
      y: { ...signal.y },
      j: {
        ...signal.j,
        pathLength: { ...normalizedPathLength },
      },
    };
  });
}
