import { Tag } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import { forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import type { PredictionOptions } from '../../../data/PredictionManager.js';
import { FREQUENCIES } from '../../../data/PredictionManager.js';
import generateNumbersPowerOfX from '../../../data/utilities/generateNumbersPowerOfX.js';
import { CheckController } from '../../elements/CheckController.js';
import { GroupPane } from '../../elements/GroupPane.js';
import { Input2Controller } from '../../elements/Input2Controller.js';
import IsotopesViewer from '../../elements/IsotopesViewer.js';
import type { LabelStyle } from '../../elements/Label.js';
import Label from '../../elements/Label.js';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import { Select2Controller } from '../../elements/Select2Controller.js';
import { useSettingImperativeHandle } from '../extra/utilities/settingImperativeHandle.js';

const NUMBER_OF_POINTS_1D = generateNumbersPowerOfX(12, 19);
const NUMBER_OF_POINTS_2D = generateNumbersPowerOfX(10, 10, {
  format: String,
});

const getPredictionFormValidation = (isNameRequired = false) =>
  Yup.object().shape({
    name: Yup.string()
      .when([], {
        is: () => isNameRequired,
        // eslint-disable-next-line unicorn/no-thenable
        then: (nameSchema) => nameSchema.required('Name is required'),
        otherwise: (nameSchema) => nameSchema.notRequired(),
      })
      .label('Name'),
    frequency: Yup.number().integer().required().label('Frequency'),
    autoExtendRange: Yup.boolean(),
    '1d': Yup.object({
      '1H': Yup.object({
        from: Yup.number().required().label("1H ' From ' "),
        to: Yup.number().required().label("1H ' To ' "),
      }),
      '13C': Yup.object().shape({
        from: Yup.number().required().label("13C ' From ' "),
        to: Yup.number().required().label("13C ' To ' "),
      }),
      lineWidth: Yup.number().integer().min(1).required().label('Line Width'),
      nbPoints: Yup.number().integer().required().label('1D Number Of Points'),
    }),
    '2d': Yup.object({
      nbPoints: Yup.object({
        x: Yup.number().integer().required().label('2D Number Of Points'),
        y: Yup.number().integer().required().label('2D Number Of Points'),
      }),
    }),
    spectra: Yup.object({
      proton: Yup.boolean(),
      carbon: Yup.boolean(),
      cosy: Yup.boolean(),
      hsqc: Yup.boolean(),
      hmbc: Yup.boolean(),
    }).test(
      'check-options',
      'You must check one of the options to start prediction',
      (obj) => {
        if (Object.values(obj).includes(true)) {
          return true;
        }
        return false;
      },
    ),
  });

const labelStyle: LabelStyle = {
  label: { flex: 4, fontWeight: '500' },
  wrapper: { flex: 8, display: 'flex', alignItems: 'center' },
  container: { padding: '5px 0' },
};

const styles = {
  select: {
    width: '100%',
    minWidth: '100px',
    maxWidth: '280px',
    height: 30,
    margin: 0,
  },
  groupHeader: {
    borderBottom: '1px solid #efefef',
    paddingBottom: '5px',
    fontWeight: '600',
    color: '#005d9e',
  },
};

interface PredictionOptionsPanelProps {
  options: PredictionOptions;
  hideName?: boolean;
  onSave: (values: any) => void;
}

function PredictionOptionsPanel(props: PredictionOptionsPanelProps, ref) {
  const { options, onSave, hideName = false } = props;
  const { handleSubmit, control } = useForm({
    defaultValues: options,
    resolver: yupResolver(getPredictionFormValidation(!hideName) as any),
  });
  useSettingImperativeHandle(ref, handleSubmit, onSave);

  return (
    <>
      {!hideName && (
        <Label title="Name" style={labelStyle}>
          <Input2Controller control={control} name="name" fill />
        </Label>
      )}
      <Label title="Frequency" style={labelStyle}>
        <Select2Controller
          control={control}
          items={FREQUENCIES}
          name="frequency"
        />
      </Label>

      <GroupPane
        text="1D Options"
        style={{
          header: styles.groupHeader,
        }}
      >
        <Label title="Auto extend range" style={labelStyle}>
          <CheckController control={control} name="autoExtendRange" />
        </Label>
        <Label
          title="1H"
          renderTitle={(title) => (
            <IsotopesViewer value={title} className="custom-label" />
          )}
          style={labelStyle}
        >
          <Label title="From">
            <NumberInput2Controller control={control} name="1d.1H.from" fill />
          </Label>
          <Label title="To" style={{ label: { padding: '0 10px' } }}>
            <NumberInput2Controller control={control} name="1d.1H.to" fill />
          </Label>
        </Label>
        <Label
          title="13C"
          renderTitle={(title) => (
            <IsotopesViewer value={title} className="custom-label" />
          )}
          style={labelStyle}
        >
          <Label title="From">
            <NumberInput2Controller control={control} name="1d.13C.from" fill />
          </Label>
          <Label title="To" style={{ label: { padding: '0 10px' } }}>
            <NumberInput2Controller control={control} name="1d.13C.to" fill />
          </Label>
        </Label>
        <Label title="Line width" style={labelStyle}>
          <NumberInput2Controller
            control={control}
            name="1d.lineWidth"
            min={1}
            stepSize={1}
            majorStepSize={1}
            rightElement={<Tag>Hz</Tag>}
          />
        </Label>
        <Label title="Number of points" style={labelStyle}>
          <Select2Controller
            control={control}
            items={NUMBER_OF_POINTS_1D}
            name="1d.nbPoints"
          />
        </Label>
      </GroupPane>
      <GroupPane
        text="2D Options"
        style={{
          header: styles.groupHeader,
        }}
      >
        <Label title="Number of points" style={labelStyle}>
          <Select2Controller
            control={control}
            items={NUMBER_OF_POINTS_2D}
            name="2d.nbPoints.x"
          />
          <span style={{ padding: '0 10px' }}> X </span>
          <Select2Controller
            control={control}
            items={NUMBER_OF_POINTS_2D}
            name="2d.nbPoints.y"
          />
        </Label>
      </GroupPane>
      <GroupPane
        text="Spectra"
        style={{
          header: styles.groupHeader,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <IsotopesOption control={control} title="1H" name="spectra.proton" />
          <IsotopesOption control={control} title="13C" name="spectra.carbon" />
          <IsotopesOption control={control} title="COSY" name="spectra.cosy" />
          <IsotopesOption control={control} title="HSQC" name="spectra.hsqc" />
          <IsotopesOption control={control} title="HMBC" name="spectra.hmbc" />
        </div>
      </GroupPane>
    </>
  );
}

interface IsotopesOptionProps {
  name: string;
  title: string;
  control: any;
}
function IsotopesOption(props: IsotopesOptionProps) {
  const { name, title, control } = props;
  return (
    <CheckController
      name={name}
      control={control}
      labelElement={
        <IsotopesViewer
          value={title}
          style={{ display: 'inline-block', padding: '0 5px' }}
        />
      }
    />
  );
}

export default forwardRef(PredictionOptionsPanel);
