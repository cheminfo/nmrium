/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useFormikContext, FieldArray } from 'formik';
import { memo } from 'react';

import CouplingsTable from './CouplingsTable';

const SignalFormTabStyle = css`
  border-spacing: 0;
  border: 1px solid #dedede;
  width: 100%;
  font-size: 12px;
  height: 100%;

  margin: 0;
  padding: 0.4rem;
  text-align: center;
`;

const SignalFormTab = memo(({ onFocus, onBlur }) => {
  const { values } = useFormikContext();

  return (
    <div css={SignalFormTabStyle}>
      <FieldArray
        name={`signals.${values.activeTab}.j`}
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
});

export default SignalFormTab;
