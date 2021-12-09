import Label from "../../elements/Label";
import FormikCheckBox from '../../elements/formik/FormikCheckBox';
import FormikInput from '../../elements/formik/FormikInput';


function ControllersTabContent() {
  return (
    <>
      <p className="section-header">Mouse Scroll Wheel Sensitivity</p>
      <Label title="Low">
        <FormikInput type="number" name="controllers.mws.low" />
      </Label>
      <Label title="high">
        <FormikInput type="number" name="controllers.mws.high" />
      </Label>
      <p className="section-header" style={{ marginTop: '40px' }}>
        Show / Hide Panels
      </p>
      <FormikCheckBox
        className="help-checkbox-element"
        label="Prevent automatic show help "
        name="controllers.help.preventAutoHelp"
      />

      <p className="section-header" style={{ marginTop: '40px' }}>
        Spectra
      </p>
      <Label
        title="Transparency of Dimmed Spectra [ 0 - 1 ]"
        // style={{ label: styles.inputLabel, wrapper: styles.inputWrapper }}
      >
        <FormikInput
          name="controllers.dimmedSpectraTransparency"
          checkValue={(value) => value >= 0 && value <= 1}
          type="number"
        />
      </Label>
    </>
  );
}

export default ControllersTabContent;
