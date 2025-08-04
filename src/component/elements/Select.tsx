import styled from '@emotion/styled';
import type { CSSProperties, ForwardedRef } from 'react';
import { forwardRef, useCallback } from 'react';

const arrowDownIcon = `url('data:image/svg+xml;utf8,<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="960px" height="560px" viewBox="0 0 960 560" enable-background="new 0 0 960 560" xml:space="preserve"><g id="Rounded_Rectangle_33_copy_4_1_"><path d="M480,344.181L268.869,131.889c-15.756-15.859-41.3-15.859-57.054,0c-15.754,15.857-15.754,41.57,0,57.431l237.632,238.937c8.395,8.451,19.562,12.254,30.553,11.698c10.993,0.556,22.159-3.247,30.555-11.698l237.631-238.937c15.756-15.86,15.756-41.571,0-57.431s-41.299-15.859-57.051,0L480,344.181z"/></g></svg>')`;

const BaseSelect = styled.select<{ width: number | string | undefined }>`
  align-self: center;
  appearance: none;
  background: ${arrowDownIcon} no-repeat right white;
  background-position-x: calc(100% - 5px);
  background-size: 15px 15px;
  border: 0.55px solid #cacaca;
  border-radius: 5px;
  font-size: 14px;
  height: 100%;
  margin: 0;
  padding: 0 5px;
  width: ${({ width }) => (width ? Number(width) - 5 : 115)}px;

  &:focus,
  input:focus {
    outline: none;
  }

  &:required:invalid {
    color: #666;
  }
`;

interface SelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    'style' | 'onChange'
  > {
  onChange?: (element: string) => void;
  items: object[];
  defaultValue?: string | number | undefined;
  style?: CSSProperties;
  placeholder?: string;
  itemValueField?: string;
  itemTextField?: string;
  returnValue?: boolean;
  textRender?: (text: string) => string;
}

const Select = forwardRef(function Select(
  props: SelectProps,
  ref: ForwardedRef<HTMLSelectElement>,
) {
  const {
    items,
    style = { width: 100 },
    onChange = () => null,
    defaultValue,
    value,
    name = '',
    className = '',
    placeholder = '',
    itemValueField = 'value',
    itemTextField = 'label',
    returnValue = true,
    textRender,
    ...otherProps
  } = props;

  const handleOnChanged = useCallback(
    (e) => {
      const [option] = e.target.selectedOptions;
      const selectedData = JSON.parse(option.dataset.value);
      onChange(returnValue ? selectedData[itemValueField] : selectedData);
    },
    [itemValueField, onChange, returnValue],
  );
  return (
    <BaseSelect
      ref={ref}
      width={style?.width}
      name={name}
      onChange={handleOnChanged}
      defaultValue={defaultValue}
      value={value}
      className={className}
      style={style}
      required
      {...otherProps}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}

      {items.map((option) => {
        const value = option[itemValueField];

        if (!['number', 'string'].includes(typeof option[itemTextField])) {
          // eslint-disable-next-line no-console
          console.log(
            `The '${itemTextField}' field should be a string , option : ${JSON.stringify(
              option,
            )}`,
          );
          return null;
        }
        if (!['number', 'string'].includes(typeof value)) {
          // eslint-disable-next-line no-console
          console.log(
            `The '${itemValueField}' field should be either a string or a number, option : ${JSON.stringify(
              option,
            )}`,
          );
          return null;
        }

        const label = String(option[itemTextField]);

        return (
          <option
            key={JSON.stringify(option)}
            value={value}
            data-value={JSON.stringify(option)}
          >
            {textRender?.(label) || label}
          </option>
        );
      })}
    </BaseSelect>
  );
});

export default Select;
