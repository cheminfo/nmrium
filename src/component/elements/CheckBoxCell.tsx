import FormikCheckBox, { FormikCheckBoxProps } from './formik/FormikCheckBox';

export function CheckBoxCell(props: FormikCheckBoxProps) {
  const { name, ...otherProps } = props;
  return (
    <FormikCheckBox
      style={{
        container: { display: 'block', margin: '0 auto', width: 'fit-content' },
      }}
      key={props.name}
      name={props.name}
      {...otherProps}
    />
  );
}
