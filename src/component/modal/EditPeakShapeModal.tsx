/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useRef, useState } from 'react';
import * as Yup from 'yup';

import { Peak } from '../../data/types/data1d';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import CloseButton from '../elements/CloseButton';
import { InputStyle } from '../elements/Input';
import Label, { LabelStyle } from '../elements/Label';
import Select from '../elements/Select';
import FormikForm from '../elements/formik/FormikForm';
import FormikInput from '../elements/formik/FormikInput';
import { CHANGE_PEAK_SHAPE } from '../reducer/types/Types';
import { formatNumber } from '../utility/formatNumber';
import { PeaksNucleusPreferences } from '../workspaces/Workspace';

import { ModalStyles } from './ModalStyle';

const styles = css`
  width: 400px;
  min-height: 250px;

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
  const { shape } = peak;
  const shapeData =
    (shape?.kind || '').toLocaleLowerCase() !== kind
      ? {
          ...getKindDefaultValues(kind),
          ...(shape?.fwhm && { fwhm: shape?.fwhm }),
        }
      : shape;
  return shapeData;
};

const validation = (kind: string) =>
  Yup.object().shape({
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

const inputStyle: InputStyle = { input: { width: '200px', textAlign: 'left' } };

interface EditPeakShapeModalProps {
  onClose?: (element?: string) => void;
  peak: Peak;
  peaksPreferences: PeaksNucleusPreferences;
}

function EditPeakShapeModal({
  onClose = () => null,
  peak,
  peaksPreferences,
}: EditPeakShapeModalProps) {
  const dispatch = useDispatch();
  const refForm = useRef<any>();
  const [kind, setKind] = useState(peak.shape?.kind as string);

  const changePeakShapeHandler = useCallback(
    (values) => {
      dispatch({
        type: CHANGE_PEAK_SHAPE,
        payload: {
          id: peak.id,
          shape: {
            ...values,
          },
        },
      });
      onClose();
    },
    [dispatch, onClose, peak.id],
  );

  const values = getValues(peak, kind);
  const valuePPM = formatNumber(peak.x, peaksPreferences.deltaPPM.format);

  return (
    <div css={[ModalStyles, styles]}>
      <div className="header handle">
        <span>{`Peak Shape Edition ( ${valuePPM} PPM)`} </span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="inner-content">
        <FormikForm
          key={JSON.stringify(values)}
          ref={refForm}
          initialValues={values}
          validationSchema={validation(kind)}
          onSubmit={changePeakShapeHandler}
        >
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

export default EditPeakShapeModal;
