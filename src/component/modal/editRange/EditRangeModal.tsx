/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { v4 } from '@lukeed/uuid';
import { useMemo, useCallback, useRef } from 'react';
import { FaSearchPlus } from 'react-icons/fa';

import { Datum1D, Range } from '../../../data/types/data1d';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/Button';
import CloseButton from '../../elements/CloseButton';
import SaveButton from '../../elements/SaveButton';
import FormikForm from '../../elements/formik/FormikForm';
import FormikOnChange from '../../elements/formik/FormikOnChange';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useSpectrum from '../../hooks/useSpectrum';
import {
  hasCouplingConstant,
  translateMultiplet,
} from '../../panels/extra/utilities/MultiplicityUtilities';
import { UPDATE_RANGE } from '../../reducer/types/Types';
import { formatNumber } from '../../utility/formatNumber';

import SignalsForm from './forms/components/SignalsForm';
import useRangeFormValidation from './forms/validation/EditRangeValidation';

const styles = css`
  width: 600px;
  height: 500px;
  padding: 5px;
  button:focus {
    outline: none;
  }
  .header {
    height: 24px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    .title {
      color: #464646;
      font-size: 15px;
      flex: 1;
      border-left: 1px solid #ececec;
      padding-left: 6px;
    }

    button {
      background-color: transparent;
      border: none;
      padding: 5px;

      svg {
        height: 16px;
      }
    }
  }
`;

interface EditRangeModalProps {
  onSaveEditRangeModal: (value: any) => Promise<void> | null | void;
  onCloseEditRangeModal: (range: any, originalRange: any) => void;
  onZoomEditRangeModal: (value: any) => void;
  range: any;
  manualRange?: boolean;
}

interface Coupling {
  multiplicity: any;
  coupling: string | number;
}

function EditRangeModal({
  onSaveEditRangeModal = () => null,
  onCloseEditRangeModal = () => null,
  onZoomEditRangeModal = () => null,
  manualRange = false,
  range: originRange,
}: EditRangeModalProps) {
  const formRef = useRef<any>(null);
  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const dispatch = useDispatch();
  const rangesPreferences = usePanelPreferences('ranges', activeTab);
  const validation = useRangeFormValidation();
  const range = useRange(originRange, manualRange);

  const handleOnZoom = useCallback(() => {
    onZoomEditRangeModal(range);
  }, [onZoomEditRangeModal, range]);

  const handleOnClose = useCallback(() => {
    onCloseEditRangeModal(range, originRange);
  }, [onCloseEditRangeModal, originRange, range]);

  const getCouplings = useCallback(
    (couplings) =>
      couplings
        .filter((coupling) => coupling.coupling !== '')
        .map((coupling) => {
          return {
            ...coupling,
            multiplicity: translateMultiplet(coupling.multiplicity),
          };
        }),
    [],
  );

  const getSignals = useCallback(
    (signals) => {
      return signals.map((signal) => {
        return {
          id: v4(),
          ...signal,
          multiplicity: signal.js
            .map((_coupling) => translateMultiplet(_coupling.multiplicity))
            .join(''),
          js: getCouplings(signal?.js || []),
        };
      });
    },
    [getCouplings],
  );

  const handleOnSave = useCallback(
    (formValues) => {
      void (async () => {
        const _range = { ...range };
        _range.signals = getSignals(formValues.signals);
        await onSaveEditRangeModal(_range);
      })();
    },
    [getSignals, onSaveEditRangeModal, range],
  );

  const data = useMemo(() => {
    const signals = range?.signals.map((signal) => {
      // counter within j array to access to right j values

      let counterJ = 0;
      const couplings: Array<Coupling> = [];
      if (signal.multiplicity) {
        signal.multiplicity.split('').forEach((_multiplicity) => {
          let js: Coupling = {
            multiplicity: _multiplicity,
            coupling: '',
          };

          if (hasCouplingConstant(_multiplicity) && signal?.js) {
            js = { ...signal.js[counterJ] } as Coupling;
            js.coupling = Number(
              formatNumber(js.coupling, rangesPreferences.coupling.format),
            );
            counterJ++;
          }
          js.multiplicity = translateMultiplet(js.multiplicity || '');
          couplings.push(js);
        });
      }
      return { ...signal, js: couplings };
    });
    return { activeTab: '0', signals };
  }, [range?.signals, rangesPreferences.coupling.format]);

  const changeHandler = useCallback(
    (values) => {
      const signals = getSignals(values.signals);

      if (
        JSON.stringify(range?.signals, (key, value) => {
          if (key !== 'id') return value;
        }) !==
        JSON.stringify(signals, (key, value) => {
          if (key !== 'id') return value;
        })
      ) {
        dispatch({
          type: UPDATE_RANGE,
          payload: { range: { ...range, signals } },
        });
      }
    },
    [dispatch, getSignals, range],
  );

  return (
    <div css={styles}>
      <div className="header handle">
        <Button.Action
          onClick={handleOnZoom}
          fill="outline"
          style={{ fontSize: '14' }}
          color={{ base: '#5f5f5f', hover: 'white' }}
        >
          <FaSearchPlus title="Set to default view on range in spectrum" />
        </Button.Action>
        <span className="title">
          {` Range and Signal edition: ${formatNumber(
            range?.from,
            rangesPreferences.from.format,
          )} ppm to ${formatNumber(
            range?.to,
            rangesPreferences.to.format,
          )} ppm`}
        </span>
        <SaveButton
          onClick={() => formRef.current.submitForm()}
          popupTitle="Save and exit"
        />

        <CloseButton onClick={handleOnClose} />
      </div>
      <FormikForm
        ref={formRef}
        initialValues={data}
        validationSchema={validation}
        onSubmit={handleOnSave}
      >
        <SignalsForm range={range} preferences={rangesPreferences} />
        <FormikOnChange onChange={changeHandler} />
      </FormikForm>
    </div>
  );
}

function useRange(range: Range, isNew: boolean) {
  const { ranges } = useSpectrum({
    ranges: { values: [] },
  }) as Datum1D;

  const id = isNew ? 'new' : range.id;
  const index = ranges.values.findIndex((rangeRecord) => rangeRecord.id === id);
  return ranges.values[index];
}

export default EditRangeModal;
