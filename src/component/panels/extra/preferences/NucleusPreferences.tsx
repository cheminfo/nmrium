import { ControllerProps, FieldValues } from 'react-hook-form';

import {
  FormatField,
  FormatFieldProps,
} from '../../../elements/FormatField.js';

import { NucleusGroup, NucleusGroupProps } from './NucleusGroup.js';

export type NucleusPreferenceField = Omit<FormatFieldProps, 'control'> & {
  id: string | number;
};

interface NucleusPreferencesProps<
  TFieldValues extends FieldValues = FieldValues,
> extends NucleusGroupProps,
    Pick<ControllerProps<TFieldValues>, 'control'> {
  fields: NucleusPreferenceField[];
}

export function NucleusPreferences(props: NucleusPreferencesProps) {
  const { nucleus, fields, renderTop, renderBottom, control } = props;
  return (
    <NucleusGroup
      nucleus={nucleus}
      renderTop={renderTop}
      renderBottom={renderBottom}
    >
      {fields.map((field) => {
        const {
          id,
          label,
          checkFieldName,
          formatFieldName,
          hideCheckField,
          hideFormatField,
          disableFormat,
        } = field;

        return (
          <FormatField
            control={control}
            key={id}
            label={label}
            checkFieldName={
              checkFieldName && `nuclei.${nucleus}.${checkFieldName}`
            }
            formatFieldName={
              formatFieldName && `nuclei.${nucleus}.${formatFieldName}`
            }
            hideCheckField={hideCheckField}
            hideFormatField={hideFormatField}
            disableFormat={disableFormat}
          />
        );
      })}
    </NucleusGroup>
  );
}
