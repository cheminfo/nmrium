/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { REFERENCES } from '../../data/constants/References';
import { useDispatch } from '../context/DispatchContext';
import CloseButton from '../elements/CloseButton';
import Select from '../elements/Select';
import FormikForm from '../elements/formik/FormikForm';
import FormikInput from '../elements/formik/FormikInput';
import { ALIGN_SPECTRA } from '../reducer/types/Types';
import Events from '../utility/Events';

const styles = css`
  overflow: auto;
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    text-align: center;
    padding: 10px 0 10px 0px;
    margin: 0px;
    color: #005d9e;
    place-items: normal;
    text-transform: none;
    background-color: #fcfcfc;
  }
  // .main-content {
  //   width: 100%;
  //   flex: 1;
  //   overflow: auto;
  //   border: none;
  // }

  .tab-content {
    width: 100%;
  }
  .row {
    display: flex;
  }

  .inner-content {
    padding: 15px 30px;
    width: 100%;
    overflow: auto;
  }

  button:focus {
    outline: none;
  }
  button:hover {
    color: #007bff;
  }
  .save-button:hover {
    background-color: #ffffff;
  }
  .save-button {
    border: none;
    padding: 0 15px;
    background-color: #ffffff5e;
    border-radius: 5px;
    height: 25px;
  }

  .footer-container {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    background: rgb(242, 242, 242);
    background: -moz-linear-gradient(
      0deg,
      rgba(242, 242, 242, 1) 0%,
      rgba(245, 245, 245, 1) 37%,
      rgba(255, 255, 255, 1) 90%
    );
    background: -webkit-linear-gradient(
      0deg,
      rgba(242, 242, 242, 1) 0%,
      rgba(245, 245, 245, 1) 37%,
      rgba(255, 255, 255, 1) 90%
    );
    background: linear-gradient(
      0deg,
      rgba(242, 242, 242, 1) 0%,
      rgba(245, 245, 245, 1) 37%,
      rgba(255, 255, 255, 1) 90%
    );
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#f2f2f2",endColorstr="#ffffff",GradientType=1);
    padding: 6px 15px;
    height: 55px;
  }

  .section-header {
    font-size: 13px;
    color: #2ca8ff;
    margin-bottom: 10px;
    border-bottom: 0.55px solid #f9f9f9;
    padding: 6px 2px;
  }

  .custom-label {
    font-size: 12px;
    font-weight: bold;
    margin-right: 10px;
    width: 120px;
  }
  .margin-10 {
    margin: 10px 0;
  }

  .input {
    font-size: 14px;
    border-radius: 5px;
    border: 1px solid #cccccc;
    padding: 5px;
    width: 100px;
    margin-right: 10px;
    height: initial !important;
  }

  .close-bt {
    border: none;
    color: red;
    background-color: transparent;
    outline: none;
    position: absolute;
    right: 10px;
    top: 2px;
    width: 30px;
    height: 30px;
  }
`;

const baseList = [{ key: 1, value: 'manual', label: 'Manual' }];

const AlignSpectraModal = ({ onClose, nucleus }) => {
  const refForm = useRef();
  const dispatch = useDispatch();
  const List = useMemo(() => {
    const list = REFERENCES[nucleus]
      ? Object.entries(REFERENCES[nucleus]).map(
          (item) => ({
            key: item[0],
            value: item[0],
            label: item[0],
          }),
          [],
        )
      : [];

    return baseList.concat(list);
  }, [nucleus]);
  const handleSave = useCallback(() => {
    refForm.current.submitForm();
  }, []);

  const submitHandler = useCallback(
    (values) => {
      dispatch({ type: ALIGN_SPECTRA, payload: values });
      onClose();
    },
    [dispatch, onClose],
  );

  useEffect(() => {
    Events.on('brushEnd', (event) => {
      const [from, to] = event.range;
      refForm.current.setValues({ ...refForm.current.values, from, to });
    });

    return () => {
      Events.off('brushEnd');
    };
  }, []);

  const optionChangeHandler = useCallback(
    (id) => {
      const value = REFERENCES[nucleus][id];
      refForm.current.setValues({
        ...refForm.current.values,
        ...value,
      });
    },
    [nucleus],
  );

  return (
    <div css={styles}>
      <div className="header handle">
        <span>Align Spectra</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="inner-content">
        <FormikForm
          ref={refForm}
          initialValues={{ from: -1, to: 1, nbPeaks: 1, targetX: 0 }}
          onSubmit={submitHandler}
        >
          <div className="row margin-10">
            <span className="custom-label">Options :</span>

            <Select
              data={List}
              style={{ width: 270, height: 30, marginBottom: '20px' }}
              onChange={optionChangeHandler}
            />
          </div>
          <div className="row margin-10">
            <span className="custom-label">Range :</span>
            <FormikInput label="From : " name="from" type="number" />
            <FormikInput label="To :" name="to" type="number" />
          </div>
          <div className="row margin-10">
            <span className="custom-label">Number of Peaks : </span>
            <FormikInput name="nbPeaks" type="number" />
          </div>
          <div className="row margin-10">
            <span className="custom-label">Target PPM :</span>
            <FormikInput laname="targetX" type="number" />
          </div>
        </FormikForm>
      </div>
      <div className="footer-container">
        <button type="button" onClick={handleSave} className="save-button">
          Done
        </button>
      </div>
    </div>
  );
};

export default AlignSpectraModal;
