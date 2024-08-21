/** @jsxImportSource @emotion/react */
import { Button, DialogBody, DialogFooter } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { FromTo } from 'cheminfo-types';
import { Signal2D } from 'nmr-processing';
import { FormProvider, useForm } from 'react-hook-form';
import { FaSearchPlus } from 'react-icons/fa';
import * as Yup from 'yup';

import DefaultPathLengths from '../../../data/constants/DefaultPathLengths';
import { DialogProps } from '../../elements/DialogManager';
import { DraggableDialog } from '../../elements/DraggableDialog';
import { ZoneData } from '../../panels/ZonesPanel/hooks/useMapZones';
import { useZoneActions } from '../../panels/ZonesPanel/hooks/useZoneActions';

import { SignalsForm } from './SignalsForm';
import { isDefaultPathLength } from './validation/isDefaultPathLength';

interface FormData {
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

  function handleSave(values) {
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
          minimal
          onClick={() => zoomToZone(zone)}
        />
      }
      onClose={onCloseDialog}
      placement="top-right"
    >
      <DialogBody
        css={css`
          background-color: white;
        `}
      >
        <FormProvider {...methods}>
          <SignalsForm />
        </FormProvider>
      </DialogBody>
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

function mapSignalsBeforeSave(signals, experiment) {
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
