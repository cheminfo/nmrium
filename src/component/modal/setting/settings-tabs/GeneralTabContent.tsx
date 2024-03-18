import { LOGGER_LEVELS } from '../../../context/LoggerContext';
import { GroupPane } from '../../../elements/GroupPane';
import Label, { LabelStyle } from '../../../elements/Label';
import FormikCheckBox from '../../../elements/formik/FormikCheckBox';
import FormikInput from '../../../elements/formik/FormikInput';
import FormikSelect from '../../../elements/formik/FormikSelect';

const labelStyle: LabelStyle = {
  label: { flex: 6 },
  wrapper: { flex: 6 },
  container: { paddingBottom: '5px' },
};

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

const LOGS_LEVELS = Object.keys(LOGGER_LEVELS).map((level) => ({
  label: level.replace(/^\w/, (c) => c.toUpperCase()),
  value: level,
}));

function GeneralTabContent() {
  return (
    <>
      <GroupPane text="General">
        <Label title="Opacity of dimmed spectra [0 - 1]" style={labelStyle}>
          <FormikInput
            name="general.dimmedSpectraOpacity"
            checkValue={(value) => Number(value) >= 0 && Number(value) <= 1}
            type="number"
            step={0.1}
            min={0}
            max={1}
            style={{ inputWrapper: { width: 60 } }}
          />
        </Label>
        <Label title="Invert actions" style={labelStyle}>
          <FormikCheckBox
            name="general.invert"
            style={{ container: { justifyContent: 'flex-start' } }}
          />
        </Label>
      </GroupPane>
      <GroupPane text="Experimental features">
        <Label title="Enable experimental features" style={labelStyle}>
          <FormikCheckBox
            name="display.general.experimentalFeatures.display"
            style={{ container: { justifyContent: 'flex-start' } }}
          />
        </Label>
      </GroupPane>
      <GroupPane text="Rendering">
        <Label title="Spectra rendering" style={labelStyle}>
          <FormikSelect
            items={SHAPE_RENDERING}
            name="general.spectraRendering"
            style={{ width: '150px' }}
          />
        </Label>
      </GroupPane>
      <GroupPane text="Logging settings">
        <Label title="Level" style={labelStyle}>
          <FormikSelect
            items={LOGS_LEVELS}
            name="general.loggingLevel"
            style={{ width: '100px' }}
          />
        </Label>
        <Label title="Popup logging level" style={labelStyle}>
          <FormikSelect
            items={LOGS_LEVELS}
            name="general.popupLoggingLevel"
            style={{ width: '100px' }}
          />
        </Label>
      </GroupPane>
    </>
  );
}

export default GeneralTabContent;
