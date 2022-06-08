/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useFormikContext } from 'formik';
import { forwardRef, useCallback, useMemo } from 'react';
import { FaPlus } from 'react-icons/fa';
import * as Yup from 'yup';

import Button from '../../../../elements/Button';
import FormikForm from '../../../../elements/formik/FormikForm';
import FormikInput from '../../../../elements/formik/FormikInput';
import { translateMultiplet } from '../../../../panels/extra/utilities/MultiplicityUtilities';
import { formatNumber } from '../../../../utility/formatNumber';
import { WorkSpacePanelPreferences } from '../../../../workspaces/Workspace';

const styles = {
  container: css`
    text-align: center;
    width: 100%;
    height: 100%;
    padding: 0.4rem;
  `,
  inputInfo: css`
    font-size: 10px;
    color: black;
    font-weight: bold;
  `,
  infoText: css`
    padding: 10px;
    font-size: 13px;
  `,

  signalContainer: css`
    border: 0.55px solid #dedede;
  `,
  inputContainer: css`
    display: flex;
    justify-content: center;
  `,
};

interface AddSignalFormTabProps {
  onFocus: (element: any) => void;
  onBlur?: () => void;
  range: any;
  preferences: WorkSpacePanelPreferences['ranges'];
}

// TODO: this seems to be a hacky use of ref.
function AddSignalFormTab(
  { onFocus, onBlur, range, preferences }: AddSignalFormTabProps,
  ref: any,
) {
  const { values, setFieldValue } = useFormikContext<any>();

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
        .test(`test-range`, '', function testNewSignalDelta(value) {
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
    <div css={styles.container}>
      <div>
        <p css={styles.infoText}>
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
          <div css={styles.inputContainer}>
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
              }}
              checkErrorAfterInputTouched={false}
            />
            <Button.Done
              style={{
                marginLeft: '5px',
                padding: '0 15px',
              }}
              onClick={triggerSubmitHandler}
            >
              <FaPlus title="Add new signal" />
            </Button.Done>
          </div>
          <p css={styles.inputInfo}>
            [
            {`${formatNumber(
              range.from,
              preferences.from.format,
            )} ppm - ${formatNumber(range.to, preferences.to.format)} ppm`}
            ]
          </p>
        </FormikForm>
      </div>
    </div>
  );
}

export default forwardRef(AddSignalFormTab);
