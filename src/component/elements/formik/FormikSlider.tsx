import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { useCallback, memo } from 'react';
import ReactSlider from 'react-slider';

interface FormikSliderProps {
  name: string;
  onAfterChange?: (element: any) => void;
}

function FormikSlider(props: FormikSliderProps) {
  const { onAfterChange = () => null, name, ...sliderProps } = props;

  const { values, setFieldValue } = useFormikContext();

  const changeHandler = useCallback(
    (value) => {
      onAfterChange(value);
      setFieldValue(name, value);
    },
    [name, onAfterChange, setFieldValue],
  );

  return (
    <ReactSlider
      className="horizontal-slider"
      thumbClassName="thumb"
      trackClassName="track"
      defaultValue={lodashGet(values, name, [0, 100])}
      onAfterChange={changeHandler}
      renderThumb={(props, state) => (
        <div {...props}>
          <span>{state.valueNow}</span>
        </div>
      )}
      pearling
      minDistance={10}
      {...sliderProps}
    />
  );
}

export default memo(FormikSlider);
