import React from 'react';

import IsotopesViewer from '../../../elements/IsotopesViewer';
import FormikColumnFormatField, {
  ColumnFormatField,
} from '../../../elements/formik/FormikColumnFormatField';

export type NucleusPreferenceField = ColumnFormatField & {
  id: string | number;
};

interface NucleusPreferencesProps {
  nucleus: string;
  fields: NucleusPreferenceField[];
  renderTop?: () => React.ReactNode;
  renderBottom?: () => React.ReactNode;
}

const styles = {
  groupContainer: {
    padding: '5px',
    borderRadius: '5px',
    margin: '10px 0px',
    backgroundColor: 'white',
  },
  header: {
    borderBottom: '1px solid #e8e8e8',
    paddingBottom: '5px',
    fontWeight: 'bold',
    color: '#4a4a4a',
  },
};

export function NucleusPreferences({
  nucleus,
  fields,
  renderTop,
  renderBottom,
}: NucleusPreferencesProps) {
  return (
    <div key={nucleus} style={styles.groupContainer}>
      <IsotopesViewer style={styles.header} value={nucleus} />
      {renderTop?.()}
      {fields.map((field) => (
        <FormikColumnFormatField
          key={field.id}
          label={field.label}
          checkControllerName={`nuclei.${nucleus}.${field.checkControllerName}`}
          formatControllerName={`nuclei.${nucleus}.${field.formatControllerName}`}
          hideCheckField={field.hideCheckField}
          hideFormatField={field.hideFormatField}
        />
      ))}
      {renderBottom?.()}
    </div>
  );
}
