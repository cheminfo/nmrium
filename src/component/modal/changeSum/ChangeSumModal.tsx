/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';

import { usePreferences } from '../../context/PreferencesContext';
import CloseButton from '../../elements/CloseButton';
import Tab from '../../elements/Tab/Tab';
import Tabs from '../../elements/Tab/Tabs';
import FormikForm from '../../elements/formik/FormikForm';
import FormikInput from '../../elements/formik/FormikInput';
import { ModalStyles } from '../ModalStyle';

import SelectMolecule from './SelectMolecule';

const styles = css`
  width: 450px;
  min-height: 350px;
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
    }
  }
`;

enum SumSetOptions {
  Auto = 'auto',
  Manual = 'manual',
}

interface SaveInput {
  sum: number | null;
  mf: {
    value: string;
    moleculeKey: string;
  } | null;
}

interface ChangeSumModalProps {
  onSave: (saveInput: SaveInput) => void;
  onClose: () => void;
  header: any;
}

export default function ChangeSumModal({
  onSave,
  onClose,
  header,
}: ChangeSumModalProps) {
  const {
    display: { general, panels },
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

  const saveHandler = useCallback(
    (values) => {
      switch (setOption) {
        case SumSetOptions.Auto: {
          onSave({ ...values, sum: null });
          break;
        }
        case SumSetOptions.Manual: {
          onSave({ ...values, mf: null });
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
          mf: Yup.object({
            value: Yup.string().required(),
            moleculeKey: Yup.string().required(),
          }).required(),
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

  return (
    // <div css={modalContainer}>
    <div css={[ModalStyles, styles]}>
      <div className="header handle">
        <span>{header}</span>

        <CloseButton onClick={onClose} />
      </div>
      <div className="tab-content">
        <FormikForm
          ref={formRef}
          onSubmit={saveHandler}
          initialValues={{ sum: null, mf: null }}
          validationSchema={validationSchema}
        >
          <Tabs activeTab={setOption} onClick={onTabChangeHandler}>
            {!general.hideSetSumFromMolecule && !panels.hideStructuresPanel && (
              <Tab tablabel="Auto" tabid={SumSetOptions.Auto}>
                <SelectMolecule name="mf" />
              </Tab>
            )}

            <Tab tablabel="Manual" tabid={SumSetOptions.Manual}>
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
        </FormikForm>
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
