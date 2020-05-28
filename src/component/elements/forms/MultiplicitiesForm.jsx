import { jsx } from '@emotion/core';
/** @jsx jsx */
import { useFormikContext } from 'formik';
import { memo } from 'react';

import SelectBox from './elements/SelectBox';

const MultiplicitiesForm = memo(() => {
  const { values } = useFormikContext();

  return (
    <div>
      <SelectBox
        name="selectedMultiplicityIndex"
        type="number"
        valuesObjectPath={['signals', values.selectedSignalIndex, 'j']}
        valueSelectionTemplate={(value) =>
          `${value.multiplicity} (${value.coupling.toFixed(3)})`
        }
      />
    </div>
  );
});

export default MultiplicitiesForm;
