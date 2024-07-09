import { Checkbox } from '@blueprintjs/core';
import { NmrData1D } from 'cheminfo-types';
import { Filters } from 'nmr-processing';
import { memo, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import generateNumbersPowerOfX from '../../data/utilities/generateNumbersPowerOfX';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import Label from '../elements/Label';
import { Select2Controller } from '../elements/Select2Controller';
import { useFilter } from '../hooks/useFilter';
import useSpectrum from '../hooks/useSpectrum';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

const sizes = generateNumbersPowerOfX(8, 21);

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
  const { handleSubmit, register, control } = useForm({
    defaultValues: { nbPoints: size, livePreview: true },
  });

  const onChange = useCallback(
    (values) => {
      const { livePreview, ...options } = values;

      if (livePreview || previousPreviewRef !== livePreview) {
        dispatch({
          type: 'CALCULATE_ZERO_FILLING_FILTER',
          payload: {
            options,
            livePreview,
          },
        });
      }
    },
    [dispatch],
  );

  function handleApplyFilter(
    values,
    triggerSource: 'apply' | 'onChange' = 'apply',
  ) {
    const { livePreview, ...options } = values;
    switch (triggerSource) {
      case 'onChange': {
        onChange(values);
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

  const { onChange: onLivePreviewChange, ...otherLivePreviewRegisterOptions } =
    register('livePreview');

  function submitHandler(triggerSource: 'apply' | 'onChange' = 'apply') {
    void handleSubmit((values) => handleApplyFilter(values, triggerSource))();
  }

  useEffect(() => {
    void handleSubmit((values) => onChange(values))();
  }, [handleSubmit, onChange]);

  return (
    <HeaderContainer>
      <Label title="Size:" style={headerLabelStyle}>
        <Select2Controller
          control={control}
          name="nbPoints"
          items={sizes}
          onItemSelect={() => {
            submitHandler('onChange');
          }}
        />
      </Label>
      <Label title="Live preview" style={{ label: { padding: '0 5px' } }}>
        <Checkbox
          style={{ margin: 0 }}
          {...otherLivePreviewRegisterOptions}
          onChange={(event) => {
            void onLivePreviewChange(event);
            submitHandler('onChange');
          }}
        />
      </Label>

      <ActionButtons
        onDone={() => submitHandler()}
        onCancel={handleCancelFilter}
      />
    </HeaderContainer>
  );
}

const MemoizedZeroFillingOptionsPanel = memo(ZeroFillingOptionsInnerPanel);

export default function ZeroFillingOptionsPanel() {
  const size = useInitZeroFillingSize();

  return <MemoizedZeroFillingOptionsPanel size={size} />;
}
