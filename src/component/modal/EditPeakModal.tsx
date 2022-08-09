/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useRef, useState } from 'react';
import * as Yup from 'yup';

import { Peak } from '../../data/types/data1d';
import ActionButtons from '../elements/ActionButtons';
import CloseButton from '../elements/CloseButton';
import { InputStyle } from '../elements/Input';
import Label, { LabelStyle } from '../elements/Label';
import Select from '../elements/Select';
import FormikForm from '../elements/formik/FormikForm';
import FormikInput from '../elements/formik/FormikInput';
import { useAlert } from '../elements/popup/Alert';

import { ModalStyles } from './ModalStyle';

const styles = css`
  width: 500px;
  min-height: 320px;

  .inner-content {
    flex: 1;
  }
`;

const getKindDefaultValues = (kind: string) => {
  return {
    kind,
    fwhm: 500,
    ...(kind === 'pseudovoigt' && { mu: 0.5 }),
  };
};
const getValues = (peak: Peak, kind: string) => {
  const { x, shape } = peak;
  const shapeData =
    (shape?.kind || '').toLocaleLowerCase() !== kind
      ? getKindDefaultValues(kind)
      : shape;
  return {
    from: '',
    to: '',
    x,
    ...shapeData,
  };
};

const validation = (kind: string) =>
  Yup.object().shape({
    x: Yup.number().required(),
    from: Yup.number().required(),
    to: Yup.number().required(),
    fwhm: Yup.number().required(),
    ...(kind === 'pseudovoigt' && { mu: Yup.number().required() }),
  });

const KINDS = ['Gaussian', 'Lorentzian', 'PseudoVoigt'].map((kind) => ({
  value: kind.toLowerCase(),
  label: kind,
}));

const labelStyle: LabelStyle = {
  container: { paddingTop: '5px' },
  label: { flex: 3, fontSize: '14px', fontWeight: 'normal' },
  wrapper: { flex: 7, display: 'flex' },
};
const subLabelStyle: LabelStyle = {
  label: { fontSize: '12px', fontWeight: 'normal' },
};
const inputStyle: InputStyle = { input: { width: '200px', textAlign: 'left' } };

interface EditPeakModalProps {
  onClose?: (element?: string) => void;
  peak: Peak;
}

function EditPeakModalModal({
  onClose = () => null,
  peak,
}: EditPeakModalProps) {
  const refForm = useRef<any>();
  const alert = useAlert();
  const [kind, setKind] = useState(peak.shape?.kind as string);

  const handleOptimize = useCallback(
    (values) => {
      void (async () => {
        const hideLoading = await alert.showLoading(
          `Peak optimization in progress`,
        );

        // eslint-disable-next-line no-console
        console.log(values);

        hideLoading();
        onClose();
      })();
    },
    [alert, onClose],
  );

  const values = getValues(peak, kind);

  return (
    <div css={[ModalStyles, styles]}>
      <div className="header handle">
        <span>Peak Shape Edition</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="inner-content">
        <FormikForm
          key={JSON.stringify(values)}
          ref={refForm}
          initialValues={values}
          validationSchema={validation(kind)}
          onSubmit={handleOptimize}
        >
          <Label title="value (PPM): " style={labelStyle}>
            <FormikInput name="x" style={inputStyle} disabled />
          </Label>
          <Label title="kind : " style={labelStyle}>
            <Select
              items={KINDS}
              style={{ margin: 0, height: 30 }}
              value={kind}
              onChange={(kind) => setKind(kind)}
            />
          </Label>

          <Label title="fwhm: " style={labelStyle}>
            <FormikInput name="fwhm" style={inputStyle} />
          </Label>

          {kind === 'pseudovoigt' && (
            <Label title="mu: " style={labelStyle}>
              <FormikInput name="mu" style={inputStyle} />
            </Label>
          )}

          <Label title="Range : " style={labelStyle}>
            <Label title="from :" style={subLabelStyle}>
              <FormikInput name="from" />
            </Label>
            <Label title="to :" style={subLabelStyle}>
              <FormikInput name="to" />
            </Label>
          </Label>
        </FormikForm>
      </div>
      <div className="footer-container">
        <ActionButtons
          style={{ flexDirection: 'row-reverse', margin: 0 }}
          onDone={() => refForm.current.submitForm()}
          doneLabel="Save"
          onCancel={() => onClose?.()}
        />
      </div>
    </div>
  );
}

export default EditPeakModalModal;
