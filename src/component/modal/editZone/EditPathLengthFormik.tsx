/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useFormikContext } from 'formik';

import DefaultPathLengths from '../../../data/constants/DefaultPathLengths';
import FormikNumberInput from '../../elements/formik/FormikNumberInput';

const editPathLengthsStyles = css`
  width: 100%;
  height: 100%;
  margin-top: 10px;
  text-align: center;

  .input-container {
    width: 100%;
    margin-top: 5px;
    text-align: center;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
  }

  button {
    flex: 2;
    padding: 5px;
    border: 1px solid gray;
    border-radius: 5px;
    height: 30px;
    margin: 0 auto;
    margin-top: 15px;
    display: block;
    width: 60px;

    color: white;
    background-color: gray;
  }

  .warning {
    margin-top: 5px;
    color: red;
  }
`;

interface InputProps {
  signalIndex: number;
}

function EditPathLengthFormik({ signalIndex }: InputProps) {
  const {
    errors,
    values,
  }: {
    values: any;
    setFieldValue: (
      field: string,
      value: any,
      shouldValidate?: boolean | undefined,
    ) => void;
    errors: any;
  } = useFormikContext();

  return (
    <div css={editPathLengthsStyles}>
      <p>Setting of the minimum and maximum path length (J coupling).</p>
      <div className="input-container">
        <FormikNumberInput
          name={`signals[${signalIndex}].j.pathLength.from`}
          defaultValue={
            values.signals[signalIndex].j?.pathLength?.from ||
            DefaultPathLengths[values.experimentType]?.from ||
            1
          }
          label="Min: "
          style={{
            input: {
              color: errors.signals?.[signalIndex].j?.pathLength?.from
                ? 'red'
                : 'black',
            },
          }}
          min={1}
          max={
            values.signals[signalIndex].j?.pathLength?.to ||
            DefaultPathLengths[values.experimentType]?.to
          }
          pattern="[1-9]+"
        />
        <FormikNumberInput
          name={`signals[${signalIndex}].j.pathLength.to`}
          defaultValue={
            values.signals[signalIndex].j?.pathLength?.to ||
            DefaultPathLengths[values.experimentType]?.to ||
            1
          }
          label="Max: "
          style={{
            input: {
              color: errors.signals?.[signalIndex].j?.pathLength?.to
                ? 'red'
                : 'black',
            },
          }}
          min={
            values.signals[signalIndex].j?.pathLength?.from ||
            DefaultPathLengths[values.experimentType]?.from ||
            1
          }
          pattern="[1-9]+"
        />
      </div>
    </div>
  );
}

export default EditPathLengthFormik;
