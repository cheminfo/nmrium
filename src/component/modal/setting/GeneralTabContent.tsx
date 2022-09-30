import Label from '../../elements/Label';
import FormikInput from '../../elements/formik/FormikInput';

function GeneralTabContent() {
  return (
    <>
      <p className="section-header">Spectra</p>
      <Label title="Opacity of dimmed spectra [ 0 - 1 ]">
        <FormikInput
          name="general.dimmedSpectraOpacity"
          checkValue={(value) => value >= 0 && value <= 1}
          type="number"
        />
      </Label>
    </>
  );
}

export default GeneralTabContent;
