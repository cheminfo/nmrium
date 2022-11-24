import FormikColumnFormatField, {
  ColumnFormatField,
} from '../../../elements/formik/FormikColumnFormatField';

import { NucleusGroup, NucleusGroupProps } from './NucleusGroup';

export type NucleusPreferenceField = ColumnFormatField & {
  id: string | number;
};

interface NucleusPreferencesProps extends NucleusGroupProps {
  fields: NucleusPreferenceField[];
}

export function NucleusPreferences({
  nucleus,
  fields,
  renderTop,
  renderBottom,
}: NucleusPreferencesProps) {
  return (
    <NucleusGroup
      nucleus={nucleus}
      renderTop={renderTop}
      renderBottom={renderBottom}
    >
      {fields.map((field) => (
        <FormikColumnFormatField
          key={field.id}
          label={field.label}
          checkControllerName={
            field.checkControllerName &&
            `nuclei.${nucleus}.${field.checkControllerName}`
          }
          formatControllerName={
            field.formatControllerName &&
            `nuclei.${nucleus}.${field.formatControllerName}`
          }
          hideCheckField={field.hideCheckField}
          hideFormatField={field.hideFormatField}
          disableFormat={field.disableFormat}
        />
      ))}
    </NucleusGroup>
  );
}
