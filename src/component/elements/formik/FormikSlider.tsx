import { useFormikContext } from 'formik';
import debounce from 'lodash/debounce';
import lodashGet from 'lodash/get';
import { useRef } from 'react';
import ReactSlider from 'react-slider';

interface FormikSliderProps {
  name: string;
  debounceTime?: number;
}

function FormikSlider(props: FormikSliderProps) {
  const { name, debounceTime = 0 } = props;

  const { values, setFieldValue } = useFormikContext();

  const debounceOnChange = useRef(
    debounce((value) => {
      setFieldValue(name, value);
    }, debounceTime),
  ).current;

  return (
    <ReactSlider
      className="horizontal-slider"
      thumbClassName="thumb"
      trackClassName="track"
      defaultValue={lodashGet(values, name, [0, 100])}
      onAfterChange={(value) => debounceOnChange(value)}
      renderThumb={(props, state) => (
        <div {...props}>
          <span>{state.valueNow}</span>
        </div>
      )}
      pearling
      minDistance={10}
    />
  );
}

export default FormikSlider;
