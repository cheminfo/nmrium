/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Formik } from 'formik';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';

import { SumOptions } from '../../../data/types/data1d/SumOptions';
import { usePreferences } from '../../context/PreferencesContext';
import CloseButton from '../../elements/CloseButton';
import Tab from '../../elements/Tab/Tab';
import Tabs from '../../elements/Tab/Tabs';
import FormikInput from '../../elements/formik/FormikInput';
import { ModalStyles } from '../ModalStyle';

import SelectMolecule from './SelectMolecule';

const styles = css`
  width: 450px;
  height: 400px;
  .header {
    display: flex;
    padding: 10px;
    span {
      font-size: 14px;
      flex: 1;
    }
  }

  .tab-content {
    flex: 1;
  }

  .manual-container {
    padding: 30px 5px;

    .input {
      width: 80% !important;
      height: 36px;
      margin: 0 auto;
    }
    .input Input {
      padding: 5px;
      text-align: center;
    }
  }

  .footer-container {
    button {
      width: 20%;
      color: white;
      background-color: gray !important;
    }
    button:hover {
      border: 1px solid gray;
      color: gray;
      background-color: white !important;
    }import { Formik } from 'formik';

  }
`;

enum SumSetOptions {
  Auto = 'auto',
  Manual = 'manual',
}

type SaveInput =
  | {
      sum: number;
      sumAuto: false;
    }
  | {
      moleculeId: string;
      mf: string;
      sumAuto: true;
    };

interface ChangeSumModalProps {
  onSave: (saveInput: SaveInput) => void;
  onClose: () => void;
  header: string;
  sumOptions: SumOptions;
}

export default function ChangeSumModal({
  onSave,
  onClose,
  header,
  sumOptions,
}: ChangeSumModalProps) {
  const {
    current: {
      display: { panels },
    },
  } = usePreferences();

  const [setOption, setActiveOption] = useState(SumSetOptions.Auto);
  const formRef = useRef<any>(null);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      formRef.current.submitForm();
    }
  }, []);

  const onTabChangeHandler = useCallback((tab) => {
    setActiveOption(tab.tabid);
  }, []);

  useEffect(() => {
    if (sumOptions?.sumAuto && panels?.structuresPanel?.display) {
      setActiveOption(SumSetOptions.Auto);
      const { mf, moleculeId: id } = sumOptions;
      formRef.current.setValues({
        sum: null,
        molecule: id && mf ? { mf, id } : null,
      });
    } else {
      setActiveOption(SumSetOptions.Manual);
      formRef.current.setValues({ sum: sumOptions?.sum || '', molecule: null });
    }
  }, [panels?.structuresPanel, sumOptions]);

  const saveHandler = useCallback(
    (values) => {
      switch (setOption) {
        case SumSetOptions.Auto: {
          const {
            molecule: { mf, id: moleculeId },
          } = values;

          onSave({ sumAuto: true, mf, moleculeId });
          break;
        }
        case SumSetOptions.Manual: {
          const { sum } = values;
          onSave({ sum, sumAuto: false });
          break;
        }
        default:
          return;
      }
      onClose();
    },
    [onClose, onSave, setOption],
  );

  const validationSchema = useMemo(() => {
    switch (setOption) {
      case SumSetOptions.Auto: {
        return Yup.object({
          molecule: Yup.object().required(),
        });
      }
      case SumSetOptions.Manual: {
        return Yup.object({
          sum: Yup.number().required(),
        });
      }
      default:
        return null;
    }
  }, [setOption]);

  const isStructurePanelVisible = panels?.structuresPanel?.display || false;

  return (
    // <div css={modalContainer}>
    <div css={[ModalStyles, styles]}>
      <div className="header handle">
        <span>{header}</span>

        <CloseButton onClick={onClose} />
      </div>
      <div className="tab-content">
        <Formik
          innerRef={formRef}
          onSubmit={saveHandler}
          initialValues={{ sum: null, molecule: null }}
          validationSchema={validationSchema}
        >
          <Tabs activeTab={setOption} onClick={onTabChangeHandler}>
            {isStructurePanelVisible && (
              <Tab title="Auto" tabid={SumSetOptions.Auto}>
                <SelectMolecule name="molecule" />
              </Tab>
            )}

            <Tab title="Manual" tabid={SumSetOptions.Manual}>
              <div className="manual-container">
                <FormikInput
                  name="sum"
                  type="number"
                  placeholder="Enter the new value"
                  onKeyDown={handleKeyDown}
                />
              </div>
            </Tab>
          </Tabs>
        </Formik>
      </div>
      <div className="footer-container">
        <button
          type="button"
          onClick={() => formRef.current.submitForm()}
          className="btn"
        >
          Set
        </button>
      </div>
    </div>
  );
}
