import { Formik, FormikProps } from 'formik';
import { Spectrum } from 'nmr-load-save';
import { useRef, CSSProperties } from 'react';
import { Modal } from 'react-science/ui';

import {
  DataExportStage,
  ExportAsJcampOptions,
  exportAsJcamp,
} from '../../data/SpectraManager';
import ActionButtons from '../elements/ActionButtons';
import FormikCheckBox from '../elements/formik/FormikCheckBox';
import FormikSelect from '../elements/formik/FormikSelect';
import { useAlert } from '../elements/popup/Alert';

const initValues: ExportAsJcampOptions = {
  onlyReal: true,
  dataExportStage: 'PROCESSED',
};

const styles: Record<
  'container' | 'row' | 'label' | 'innerContainer',
  CSSProperties
> = {
  container: {
    width: '25em',
    padding: '1.5em 3em',
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    paddingBottom: '0.5em',
  },
  label: {
    flex: 6,
    fontSize: '1em',
    fontWeight: 'bold',
  },
  innerContainer: {
    flex: 6,
    justifyContent: 'flex-start',
  },
};

const DATA_STAGES = Object.keys(DataExportStage).map((key) => ({
  label: key,
  value: DataExportStage[key],
}));

interface ExportAsJCAMPProps {
  closeDialog: () => void;
  spectrum: Spectrum;
}

function ExportAsJcampModal(props: ExportAsJCAMPProps) {
  const { closeDialog, spectrum } = props;
  const refForm = useRef<FormikProps<any>>(null);
  const alert = useAlert();

  function submitHandler(options) {
    void (async () => {
      const hideLoading = await alert.showLoading(
        'export as JCAMP in progress',
      );
      try {
        exportAsJcamp(spectrum, options);
      } catch (error: any) {
        alert.error(error.message);
      } finally {
        closeDialog?.();
        hideLoading();
      }
    })();
  }

  return (
    <Modal hasCloseButton isOpen onRequestClose={closeDialog}>
      <Modal.Header>
        <span>Export as JCAMP</span>
      </Modal.Header>
      <Modal.Body>
        <div>
          <Formik
            innerRef={refForm}
            initialValues={initValues}
            onSubmit={submitHandler}
          >
            <div style={styles.container}>
              <div style={styles.row}>
                <span style={styles.label}> Data </span>
                <div style={styles.innerContainer}>
                  <FormikSelect
                    name="dataExportStage"
                    items={DATA_STAGES}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div style={styles.row}>
                <span style={styles.label}> Only real </span>
                <div style={styles.innerContainer}>
                  <FormikCheckBox name="onlyReal" />
                </div>
              </div>
            </div>
          </Formik>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ActionButtons
            style={{ flexDirection: 'row-reverse', margin: 0 }}
            onDone={() => refForm.current?.submitForm()}
            doneLabel="export"
            onCancel={() => {
              closeDialog?.();
            }}
          />
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default ExportAsJcampModal;
