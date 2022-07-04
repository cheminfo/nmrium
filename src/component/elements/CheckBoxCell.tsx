import FormikCheckBox from './formik/FormikCheckBox';

export function CheckBoxCell(props) {
  return (
    <FormikCheckBox
      style={{
        container: { display: 'block', margin: '0 auto', width: 'fit-content' },
      }}
      key={props.name}
      name={props.name}
    />
  );
}
