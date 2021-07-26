/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useFormikContext } from 'formik';
import { useCallback, useMemo } from 'react';
import { FaPlus } from 'react-icons/fa';
import * as Yup from 'yup';

import { forwardRefWithAs } from '../../../../../utils';
import { useChartData } from '../../../../context/ChartContext';
import Button from '../../../../elements/Button';
import FormikForm from '../../../../elements/formik/FormikForm';
import FormikInput from '../../../../elements/formik/FormikInput';
import { translateMultiplet } from '../../../../panels/extra/utilities/MultiplicityUtilities';
import { useFormatNumberByNucleus } from '../../../../utility/FormatNumber';

const AddSignalFormTabStyle = css`
  text-align: center;
  width: 100%;
  height: 100%;
  padding: 0.4rem;

  .info-text {
    padding: 10px;
    font-size: 13px;
  }
  .input-notes {
    font-size: 10px;
    color: black;
    font-weight: bold;
  }

  input {
    background-color: transparent;
    border: 0.55px solid #dedede;
    width: 50%;
    text-align: center;
    outline: none;
  }

  .add-signal-container {
    border: 0.55px solid #dedede;
  }

  .addSignalButton {
    margin-top: 15px;
    margin-top: 20px;
    width: 100%;
    background-color: #fcfcfc;
    border-top: 0.55px solid #dedede;
    align-items: center;
    justify-content: center;
    display: flex;
    padding: 0.4rem;
    font-size: 12px;
  }
  .addSignalButton:disabled {
    opacity: 0.6;
  }
`;

interface AddSignalFormTabProps {
  onFocus: (element: any) => void;
  onBlur?: () => void;
  range: any;
}

function AddSignalFormTab(
  { onFocus, onBlur, range }: AddSignalFormTabProps,
  ref,
) {
  const { values, setFieldValue } = useFormikContext<any>();
  const { activeTab } = useChartData();
  const format = useFormatNumberByNucleus(activeTab as string);

  const saveHandler = useCallback(
    (val) => {
      const newSignal = {
        multiplicity: 'm',
        kind: 'signal',
        delta: Number(val.newSignalDelta),
        js: [{ multiplicity: translateMultiplet('m'), coupling: '' }],
      };
      const _signals = values.signals.slice().concat(newSignal);

      setFieldValue('signals', _signals);
      setFieldValue('activeTab', String(_signals.length - 1));
    },
    [setFieldValue, values.signals],
  );

  const validation = useMemo(() => {
    return Yup.object().shape({
      newSignalDelta: Yup.number()
        .test(`test-range`, '', function (value) {
          const { path, createError } = this;
          if (value && value > range.from && value < range.to) {
            return true;
          }

          const errorMessage = ` ${
            value ? value.toFixed(5) : 0
          } ppm out of the range`;
          return createError({ path, message: errorMessage });
        })
        .required(),
    });
  }, [range]);

  const triggerSubmitHandler = useCallback(() => {
    ref.current.submitForm();
  }, [ref]);

  return (
    <div css={AddSignalFormTabStyle}>
      <div className="add-signal-container">
        <p className="info-text">
          Edit or select a delta value of new signal (ppm):
        </p>
        <FormikForm
          ref={ref}
          validationSchema={validation}
          initialValues={{
            newSignalDelta: (range.from + range.to) / 2,
          }}
          onSubmit={saveHandler}
        >
          <FormikInput
            name="newSignalDelta"
            type="number"
            placeholder={`𝛅 (ppm)`}
            onFocus={onFocus}
            onBlur={onBlur}
            style={{
              input: {
                width: '250px',
                height: '30px',
              },
              container: {
                justifyContent: 'center',
              },
            }}
            checkErrorAfterInputTouched={false}
          />
          <p className="input-notes">
            [ {`${format(range.from)} ppm - ${format(range.to)} ppm`} ]
          </p>

          <Button className="addSignalButton" onClick={triggerSubmitHandler}>
            <FaPlus title="Add new signal" />
          </Button>
        </FormikForm>
      </div>
    </div>
  );
}

export default forwardRefWithAs(AddSignalFormTab);
