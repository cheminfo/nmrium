import { NmrData1D } from 'cheminfo-types';
import { Formik } from 'formik';
import { Filters } from 'nmr-processing';
import { memo, useRef } from 'react';

import generateNumbersPowerOfX from '../../data/utilities/generateNumbersPowerOfX';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import Label from '../elements/Label';
import FormikCheckBox from '../elements/formik/FormikCheckBox';
import FormikOnChange from '../elements/formik/FormikOnChange';
import FormikSelect from '../elements/formik/FormikSelect';
import { useFilter } from '../hooks/useFilter';
import useSpectrum from '../hooks/useSpectrum';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

const Sizes = generateNumbersPowerOfX(8, 21);

function useInitZeroFillingSize() {
  const filter = useFilter(Filters.zeroFilling.id);
  const { data } = useSpectrum();
  if (filter) {
    return filter.value.nbPoints;
  } else if (data) {
    return 2 ** Math.round(Math.log2((data as NmrData1D).x.length * 2));
  }
  return 0;
}

function ZeroFillingOptionsInnerPanel(props: { size: number }) {
  const { size } = props;
  const dispatch = useDispatch();
  const previousPreviewRef = useRef<boolean>(true);

  function handleApplyFilter(
    values,
    triggerSource: 'apply' | 'onChange' = 'apply',
  ) {
    const { livePreview, ...options } = values;
    switch (triggerSource) {
      case 'onChange': {
        if (livePreview || previousPreviewRef !== livePreview) {
          dispatch({
            type: 'CALCULATE_ZERO_FILLING_FILTER',
            payload: {
              options,
              livePreview,
            },
          });
        }
        break;
      }

      case 'apply': {
        dispatch({
          type: 'APPLY_ZERO_FILLING_FILTER',
          payload: {
            options,
          },
        });
        break;
      }
      default:
        break;
    }
    previousPreviewRef.current = livePreview;
  }

  function handleCancelFilter() {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
  }

  return (
    <HeaderContainer>
      <Formik
        onSubmit={(values) => handleApplyFilter(values)}
        initialValues={{ nbPoints: size, livePreview: true }}
      >
        {({ submitForm }) => (
          <>
            <Label title="Size:  " style={headerLabelStyle}>
              <FormikSelect
                items={Sizes}
                style={{ marginLeft: 10, marginRight: 10 }}
                name="nbPoints"
              />
            </Label>
            <Label
              title="Live preview "
              htmlFor="livePreview"
              style={{ label: { padding: '0 5px' } }}
            >
              <FormikCheckBox name="livePreview" />
            </Label>
            <FormikOnChange
              onChange={(values) => handleApplyFilter(values, 'onChange')}
              enableOnload
            />
            <ActionButtons onDone={submitForm} onCancel={handleCancelFilter} />
          </>
        )}
      </Formik>
    </HeaderContainer>
  );
}

const MemoizedZeroFillingOptionsPanel = memo(ZeroFillingOptionsInnerPanel);

export default function ZeroFillingOptionsPanel() {
  const size = useInitZeroFillingSize();

  return <MemoizedZeroFillingOptionsPanel size={size} />;
}
