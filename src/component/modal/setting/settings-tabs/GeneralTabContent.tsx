import { GroupPane } from '../../../elements/GroupPane';
import Label from '../../../elements/Label';
import FormikCheckBox from '../../../elements/formik/FormikCheckBox';
import FormikInput from '../../../elements/formik/FormikInput';
import FormikSelect from '../../../elements/formik/FormikSelect';

const SHAPE_RENDERING = [
  {
    label: 'Auto',
    value: 'auto',
  },
  {
    label: 'Optimize speed',
    value: 'optimizeSpeed',
  },
  {
    label: 'Crisp edges',
    value: 'crispEdges',
  },
  {
    label: 'Geometric precision',
    value: 'geometricPrecision',
  },
];

const LOGS_LEVELS = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
].map((level) => ({
  label: level.replace(/^\w/, (c) => c.toUpperCase()),
  value: level,
}));

function GeneralTabContent() {
  return (
    <>
      <GroupPane text="Spectra">
        <Label title="Opacity of dimmed spectra [ 0 - 1 ]">
          <FormikInput
            name="general.dimmedSpectraOpacity"
            checkValue={(value) => Number(value) >= 0 && Number(value) <= 1}
            type="number"
            step={0.1}
            min={0}
            max={1}
          />
        </Label>
      </GroupPane>
      <GroupPane text="Experimental features">
        <Label
          title="Enable experimental features"
          htmlFor="display.general.experimentalFeatures.display"
        >
          <FormikCheckBox name="display.general.experimentalFeatures.display" />
        </Label>
      </GroupPane>
      <GroupPane text="Rendering">
        <Label title="Spectra rendering ">
          <FormikSelect
            items={SHAPE_RENDERING}
            name="general.spectraRendering"
            style={{ width: '150px' }}
          />
        </Label>
      </GroupPane>
      <GroupPane text="Logging settings">
        <Label title="Level ">
          <FormikSelect
            items={LOGS_LEVELS}
            name="general.loggingLevel"
            style={{ width: '100px' }}
          />
        </Label>
      </GroupPane>
    </>
  );
}

export default GeneralTabContent;
