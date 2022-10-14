import { useFormikContext } from 'formik';
import { CSSProperties } from 'react';

const styles: Record<'container' | 'infoText' | 'errorText', CSSProperties> = {
  container: {
    textAlign: 'center',
    width: '100%',
  },
  infoText: {
    padding: '10px',
    margin: '10px 0',
    fontSize: '14px',
    textAlign: 'left',
    color: 'white',
    backgroundColor: '#5f5f5f',
    borderRadius: '5px',
  },

  errorText: {
    color: 'red',
  },
};

const EDIT_SIGNAL_INFO_TEXT = `Focus on an input field and press Shift + Drag and Drop to draw a coupling constant in spectrum view.`;
const ADD_SIGNAL_INFO_TEXT = `Focus on the input field and press Shift + Left mouse click to select new signal delta value in spectrum view.`;

const InfoText = (props: { value: string; type?: 'info' | 'error' }) => {
  const { value, type = 'info' } = props;
  return (
    <p
      style={{ ...styles.infoText, ...(type === 'error' && styles.errorText) }}
    >
      {value}
    </p>
  );
};

export function SignalFormInfo() {
  const {
    values,
    errors,
  }: {
    values: any;
    errors: any;
  } = useFormikContext();

  return (
    <div
      style={{
        textAlign: 'center',
        width: '100%',
      }}
    >
      {errors.signals &&
      (errors.signals.noSignals || errors.signals.noCouplings) ? (
        <div>
          <p className="errorText">
            {errors.signals.noSignals || errors.signals.noCouplings[0].message}
          </p>
          {errors.signals.noSignals && (
            <InfoText value={ADD_SIGNAL_INFO_TEXT} />
          )}
        </div>
      ) : values.activeTab === 'addSignalTab' ? (
        <InfoText value={ADD_SIGNAL_INFO_TEXT} />
      ) : (
        <InfoText value={EDIT_SIGNAL_INFO_TEXT} />
      )}
    </div>
  );
}
