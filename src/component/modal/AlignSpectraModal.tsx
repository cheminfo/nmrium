/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrOverlay } from 'cheminfo-font';
import { Formik } from 'formik';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Modal, useOnOff } from 'react-science/ui';

import { REFERENCES } from '../../data/constants/References';
import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import ButtonToolTip from '../elements/ButtonToolTip';
import { InputStyle } from '../elements/Input';
import Label, { LabelStyle } from '../elements/Label';
import Select from '../elements/Select';
import FormikInput from '../elements/formik/FormikInput';
import Events from '../utility/Events';

import { ModalStyles } from './ModalStyle';

const labelStyle: LabelStyle = {
  label: { flex: 4, fontWeight: '500' },
  wrapper: { flex: 8, display: 'flex', alignItems: 'center' },
  container: { padding: '5px 0' },
};

const inputStyle: InputStyle = {
  input: {
    padding: '5px',
  },
};

const baseList = [{ key: 1, value: 'manual', label: 'Manual' }];

interface AlignSpectraModalProps {
  onClose?: (element?: string) => void;
  nucleus: any;
}

function AlignSpectraModal({
  onClose = () => null,
  nucleus,
}: AlignSpectraModalProps) {
  const refForm = useRef<any>();
  const dispatch = useDispatch();
  const List = useMemo(() => {
    const list = REFERENCES[nucleus]
      ? Object.entries(REFERENCES[nucleus]).map((item) => ({
          value: item[0],
          label: item[0],
        }))
      : [];

    return baseList.concat(list as any);
  }, [nucleus]);
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);

  const openHandler = useCallback(() => {
    dispatch({ type: 'RESET_SELECTED_TOOL' });
    openDialog();
  }, [dispatch, openDialog]);

  const handleSave = useCallback(() => {
    refForm.current.submitForm();
  }, []);

  const submitHandler = useCallback(
    (values) => {
      dispatch({ type: 'ALIGN_SPECTRA', payload: values });
      onClose();
      closeDialog();
    },
    [closeDialog, dispatch, onClose],
  );

  useEffect(() => {
    function handler(event: any) {
      const [from, to] = event.range;
      refForm.current.setValues({ ...refForm.current.values, from, to });
    }

    Events.on('brushEnd', handler);

    return () => {
      Events.off('brushEnd', handler);
    };
  }, []);

  const optionChangeHandler = useCallback(
    (id) => {
      const value = REFERENCES[nucleus][id];
      const { delta = 0, ...resValues } = value || { delta: 0 };
      refForm.current.setValues({
        ...refForm.current.values,
        targetX: delta,
        ...resValues,
      });
    },
    [nucleus],
  );

  const styles = css`
    .header {
      padding: 0;
    }

    div:has(.header) {
      justify-content: center;
    }
  `;

  return (
    <>
      <ButtonToolTip popupTitle="Spectra calibration" onClick={openHandler}>
        <SvgNmrOverlay style={{ fontSize: '18px' }} />
      </ButtonToolTip>

      <Modal
        hasCloseButton
        isOpen={isOpenDialog}
        onRequestClose={() => {
          onClose();
          closeDialog();
        }}
        maxWidth={1000}
      >
        <div css={[ModalStyles, styles]}>
          <Modal.Header>
            <div className="header handle">
              <span>Spectra calibration</span>
            </div>
          </Modal.Header>

          <div className="inner-content" style={{ flex: 1 }}>
            <Formik
              innerRef={refForm}
              initialValues={{ from: -1, to: 1, nbPeaks: 1, targetX: 0 }}
              onSubmit={submitHandler}
            >
              <>
                <Label title="Options" style={labelStyle}>
                  <Select
                    items={List}
                    style={{ width: '100%', height: 30 }}
                    onChange={optionChangeHandler}
                  />
                </Label>

                <Label title="Range" style={labelStyle}>
                  <Label title="From">
                    <FormikInput name="from" type="number" style={inputStyle} />
                  </Label>
                  <Label title="To" style={{ label: { padding: '0 10px' } }}>
                    <FormikInput name="to" type="number" style={inputStyle} />
                  </Label>
                </Label>

                <Label title="Number of Peaks" style={labelStyle}>
                  <FormikInput
                    name="nbPeaks"
                    type="number"
                    style={inputStyle}
                  />
                </Label>
                <Label title="Target PPM" style={labelStyle}>
                  <FormikInput
                    name="targetX"
                    type="number"
                    style={inputStyle}
                  />
                </Label>
              </>
            </Formik>
          </div>
          <div className="footer-container">
            <Button.Done onClick={handleSave}>Done</Button.Done>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default AlignSpectraModal;
