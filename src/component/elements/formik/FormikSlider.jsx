import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { useCallback, memo } from 'react';
import ReactSlider from 'react-slider';

function FormikSlider({ onAfterChange, name, ...props }) {
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
      // ariaLabel={['Lower thumb', 'Upper thumb']}
      // ariaValuetext={(state) => ` ${state.valueNow}`}
      renderThumb={(props, state) => (
        <div {...props}>
          <span>{state.valueNow}</span>
        </div>
      )}
      pearling
      minDistance={10}
      {...props}
    />
  );
}

FormikSlider.defaultProps = {
  onColorChange: () => null,
};

export default memo(FormikSlider);
