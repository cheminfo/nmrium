import { Button, DialogFooter } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Signal2D } from '@zakodium/nmr-types';
import type { FromTo } from 'cheminfo-types';
import { FormProvider, useForm } from 'react-hook-form';
import { FaSearchPlus } from 'react-icons/fa';
import * as Yup from 'yup';

import DefaultPathLengths from '../../../data/constants/DefaultPathLengths.js';
import type { DialogProps } from '../../elements/DialogManager.js';
import { DraggableDialog } from '../../elements/DraggableDialog.js';
import { StyledDialogBody } from '../../elements/StyledDialogBody.js';
import type { ZoneData } from '../../panels/ZonesPanel/hooks/useMapZones.js';
import { useZoneActions } from '../../panels/ZonesPanel/hooks/useZoneActions.js';

import { SignalsForm } from './SignalsForm.js';
import { isDefaultPathLength } from './validation/isDefaultPathLength.js';

export interface FormData {
  activeTab: string;
  signals: Signal2D[];
}

const signalSchema = Yup.object().shape({
  j: Yup.object().shape({
    pathLength: Yup.object().shape({
      from: Yup.number().required().positive().integer(),
      to: Yup.number().required().positive().integer(),
    }),
  }),
});

const zoneFormValidation = Yup.object().shape({
  activeTab: Yup.string(),
  signals: Yup.array()
    .of(signalSchema)
    .min(1, 'There must be at least one signal in a zone!'),
});

export function EditZoneModal(props: DialogProps<ZoneData>) {
  const { dialogData: zone, onCloseDialog } = props;
  const { saveZone, zoomToZone } = useZoneActions();

  function handleSave(values: any) {
    void (async () => {
      const zoneData = {
        ...zone,
        signals: mapSignalsBeforeSave(
          values?.signals,
          zone.tableMetaInfo.experiment,
        ),
      };
      saveZone(zoneData);
      onCloseDialog();
    })();
  }

  const methods = useForm<FormData>({
    defaultValues: {
      activeTab: '0',
      signals: mapSignals(zone),
    },
    resolver: yupResolver(zoneFormValidation) as any,
  });

  const { handleSubmit } = methods;
  return (
    <DraggableDialog
      hasBackdrop={false}
      canOutsideClickClose={false}
      style={{ width: 700 }}
      title="Zone and Signal edition"
      isOpen
      headerLeftElement={
        <Button
          intent="success"
          style={{ marginRight: '5px', borderRadius: '5px' }}
          icon={
            <FaSearchPlus title="Set to default view on range in spectrum" />
          }
          variant="minimal"
          onClick={() => zoomToZone(zone)}
        />
      }
      onClose={onCloseDialog}
      placement="top-right"
    >
      <StyledDialogBody>
        <FormProvider {...methods}>
          <SignalsForm />
        </FormProvider>
      </StyledDialogBody>
      <DialogFooter>
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button intent="success" onClick={() => handleSubmit(handleSave)()}>
            Save and Exit
          </Button>
        </div>
      </DialogFooter>
    </DraggableDialog>
  );
}

function mapSignalsBeforeSave(signals: any, experiment: any) {
  const outputSignals: Signal2D[] = [];

  for (const signal of signals) {
    if (isDefaultPathLength(signal.j?.pathLength as FromTo, experiment)) {
      delete signal.j?.pathLength;
      if (signal.j && Object.keys(signal.j).length === 0) {
        delete signal.j;
      }
    }
    outputSignals.push(signal);
  }

  return outputSignals;
}
function mapSignals(zone: ZoneData) {
  const outputSignals: Signal2D[] = [];
  const {
    signals,
    tableMetaInfo: { experiment },
  } = zone;
  const { from = 1, to = 1 } = DefaultPathLengths?.[experiment] || {};
  for (const signal of signals) {
    const mappedSignal = {
      ...signal,
      j: {
        pathLength: {
          from,
          to,
        },
        ...signal.j,
      },
    };

    outputSignals.push(mappedSignal);
  }

  return outputSignals;
}
