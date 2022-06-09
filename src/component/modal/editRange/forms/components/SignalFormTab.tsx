import { useFormikContext, FieldArray } from 'formik';
import { CSSProperties, memo } from 'react';

import CouplingsTable from './CouplingsTable';

const style: CSSProperties = {
  borderSpacing: '0',
  width: '100%',
  fontSize: '12px',
  height: '100%',
  margin: '0',
  padding: '0.4rem',
  textAlign: 'center',
};

interface SignalFormTabProps {
  onFocus: (element: any) => void;
  onBlur?: () => void;
}

function SignalFormTab({ onFocus, onBlur }: SignalFormTabProps) {
  const { values } = useFormikContext<{ activeTab: string }>();

  return (
    <div style={style}>
      <FieldArray
        name={`signals.${values.activeTab}.js`}
        render={({ push, remove }) => (
          <div>
            <CouplingsTable
              push={push}
              remove={remove}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        )}
      />
    </div>
  );
}

export default memo(SignalFormTab);
