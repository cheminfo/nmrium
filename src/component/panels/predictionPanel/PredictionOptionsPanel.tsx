import { Formik, FormikConfig } from 'formik';
import { forwardRef } from 'react';
import * as Yup from 'yup';

import {
  FREQUENCIES,
  PredictionOptions,
} from '../../../data/PredictionManager';
import generateNumbersPowerOfX from '../../../data/utilities/generateNumbersPowerOfX';
import { GroupPane } from '../../elements/GroupPane';
import { InputStyle } from '../../elements/Input';
import IsotopesViewer from '../../elements/IsotopesViewer';
import Label, { LabelStyle } from '../../elements/Label';
import FormikCheckBox from '../../elements/formik/FormikCheckBox';
import FormikErrorsSummary from '../../elements/formik/FormikErrorsSummary';
import FormikInput from '../../elements/formik/FormikInput';
import FormikSelect from '../../elements/formik/FormikSelect';

const NUMBER_OF_POINTS_1D = generateNumbersPowerOfX(12, 19);
const NUMBER_OF_POINTS_2D = generateNumbersPowerOfX(10, 10, {
  format: (value) => value,
});

const predictionFormValidation = Yup.object().shape({
  name: Yup.string().label('Name'),
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
const inputStyle: InputStyle = {
  input: {
    padding: '5px',
  },
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

interface PredictionOptionsPanelProps
  extends Pick<FormikConfig<any>, 'onSubmit'> {
  options: PredictionOptions;
  hideName?: boolean;
}

function PredictionOptionsPanel(props: PredictionOptionsPanelProps, ref) {
  const { options, onSubmit, hideName = false } = props;

  return (
    <Formik
      initialValues={options}
      validationSchema={predictionFormValidation}
      enableReinitialize
      onSubmit={onSubmit}
      innerRef={ref}
    >
      <>
        <FormikErrorsSummary />
        {!hideName && (
          <Label title="Name" style={labelStyle}>
            <FormikInput name="name" style={inputStyle} />
          </Label>
        )}
        <Label title="Frequency" style={labelStyle}>
          <FormikSelect
            items={FREQUENCIES}
            style={styles.select}
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
            <FormikCheckBox name="autoExtendRange" />
          </Label>
          <Label
            title="1H"
            renderTitle={(title) => (
              <IsotopesViewer value={title} className="custom-label" />
            )}
            style={labelStyle}
          >
            <Label title="From">
              <FormikInput name="1d.1H.from" type="number" style={inputStyle} />
            </Label>
            <Label title="To" style={{ label: { padding: '0 10px' } }}>
              <FormikInput name="1d.1H.to" type="number" style={inputStyle} />
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
              <FormikInput
                name="1d.13C.from"
                type="number"
                style={inputStyle}
              />
            </Label>
            <Label title="To" style={{ label: { padding: '0 10px' } }}>
              <FormikInput name="1d.13C.to" type="number" style={inputStyle} />
            </Label>
          </Label>
          <Label title="Line Width" style={labelStyle}>
            <FormikInput name="1d.lineWidth" type="number" style={inputStyle} />
            <span style={{ paddingLeft: '0.4rem' }}> Hz </span>
          </Label>
          <Label title="Number of Points" style={labelStyle}>
            <FormikSelect
              items={NUMBER_OF_POINTS_1D}
              name="1d.nbPoints"
              style={styles.select}
            />
          </Label>
        </GroupPane>
        <GroupPane
          text="2D Options"
          style={{
            header: styles.groupHeader,
          }}
        >
          <Label title="Number of Points" style={labelStyle}>
            <FormikSelect
              items={NUMBER_OF_POINTS_2D}
              name="2d.nbPoints.x"
              style={{ margin: 0, height: 30 }}
            />
            <span style={{ padding: '0 10px' }}> X </span>
            <FormikSelect
              items={NUMBER_OF_POINTS_2D}
              name="2d.nbPoints.y"
              style={{ margin: 0, height: 30 }}
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
            <IsotopesOption title="1H" name="spectra.proton" />
            <IsotopesOption title="13C" name="spectra.carbon" />
            <IsotopesOption title="COSY" name="spectra.cosy" />
            <IsotopesOption title="HSQC" name="spectra.hsqc" />
            <IsotopesOption title="HMBC" name="spectra.hmbc" />
          </div>
        </GroupPane>
      </>
    </Formik>
  );
}

interface IsotopesOptionProps {
  name: string;
  title: string;
}
function IsotopesOption(props: IsotopesOptionProps) {
  const { name, title } = props;
  return (
    <FormikCheckBox
      name={name}
      style={{
        checkbox: { display: 'flex' },
        container: { flexDirection: 'row-reverse', padding: '0 5px' },
      }}
      renderLabel={() => (
        <label htmlFor={name}>
          <IsotopesViewer value={title} style={{ padding: '0 5px' }} />
        </label>
      )}
    />
  );
}

export default forwardRef(PredictionOptionsPanel);
