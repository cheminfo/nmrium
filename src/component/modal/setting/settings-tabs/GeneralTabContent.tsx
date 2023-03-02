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

function GeneralTabContent() {
  return (
    <>
      <GroupPane text="Spectra">
        <Label title="Opacity of dimmed spectra [ 0 - 1 ]">
          <FormikInput
            name="general.dimmedSpectraOpacity"
            checkValue={(value) => value >= 0 && value <= 1}
            type="number"
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
    </>
  );
}

export default GeneralTabContent;
