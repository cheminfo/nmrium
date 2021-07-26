/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useFormikContext, FieldArray } from 'formik';
import { memo } from 'react';

import CouplingsTable from './CouplingsTable';

const SignalFormTabStyle = css`
  border-spacing: 0;
  width: 100%;
  font-size: 12px;
  height: 100%;

  margin: 0;
  padding: 0.4rem;
  text-align: center;
`;

interface SignalFormTabProps {
  onFocus: (element: any) => void;
  onBlur?: () => void;
}

function SignalFormTab({ onFocus, onBlur }: SignalFormTabProps) {
  const { values } = useFormikContext<{ activeTab: string }>();

  return (
    <div css={SignalFormTabStyle}>
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
