import {
  CSSProperties,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  KeyboardEvent
} from 'react';

import Input, { InputProps } from './Input';

interface EditableColumnProps
  extends Omit<InputProps, 'style' | 'value' | 'type'> {
  onSave?: (element: any) => void;
  onEditStart?: (element: any) => void;
  type?: 'number' | 'text';
  editStatus?: boolean;
  value: string | number;
  style?: CSSProperties;
  validate?: (value?: any) => boolean;
  textOverFlowEllipses?: boolean;
}

const EditableColumn = forwardRef(function EditableColumn(
  props: EditableColumnProps,
  ref: any,
) {
  const {
    onSave = () => null,
    value,
    type = 'text',
    style,
    onEditStart = () => null,
    editStatus = false,
    validate = () => true,
    textOverFlowEllipses = false,
    ...InputProps
  } = props;

  const [enabled, enableEdit] = useState<boolean | undefined>(editStatus);
  const [isValid, setValid] = useState<boolean>(true);

  useImperativeHandle(ref, () => ({
    startEdit: () => {
      enableEdit(true);
    },
    closeEdit: () => {
      enableEdit(false);
    },
  }));

  const mouseClickCallback = useCallback((e: MouseEvent) => {
    // eslint-disable-next-line unicorn/prefer-dom-node-dataset
    if (!(e.composedPath()[0] as HTMLInputElement).hasAttribute("data-editable-column")) {
      enableEdit(false);
      window.removeEventListener('mousedown', mouseClickCallback);
    }
  }, []);

  function startEditHandler() {
    window.addEventListener('mousedown', mouseClickCallback);
    onEditStart(true);
    enableEdit(true);
  }

  function handleValidation(event) {
    const valid = validate(event?.target.value);
    setValid(valid);

  }

  function handleSave(event: KeyboardEvent<HTMLInputElement>) {
    // when press Enter or Tab
    if (isValid && ['Enter', 'Tab'].includes(event.key)) {
      onSave(event);
      enableEdit(false);
    } else
      // close edit mode if press Enter and the field not valid
      if (event.key === "Escape") {
        enableEdit(false);
        window.removeEventListener('mousedown', mouseClickCallback);
      }
  }

  return (
    <div
      style={{
        display: 'table',
        width: '100%',
        height: '100%',
        ...(textOverFlowEllipses
          ? { whiteSpace: 'nowrap', overflow: 'hidden', display: 'inline-flex' }
          : {}),
        ...style,
      }}
      className="editable-column-input"
      onDoubleClick={startEditHandler}
    >
      {!enabled && (
        <span
          style={{
            display: 'table-cell',
            verticalAlign: 'middle',
            width: 'inherit',
            ...(textOverFlowEllipses
              ? { textOverflow: 'ellipsis', overflow: 'hidden' }
              : {}),
          }}
        >
          {value}
        </span>
      )}
      {enabled && (
        <div style={{
          display: 'table-cell', verticalAlign: 'middle'
        }} >
          <Input
            data-editable-column
            style={{
              inputWrapper: {
                width: '100%',
                ...(!isValid && { borderColor: 'red' }),
              },
            }}
            enableAutoSelect
            className="editable-column"
            value={value}
            type={type}
            onChange={handleValidation}
            onKeyUp={handleSave}
            onKeyDown={(e) => { if (e.key === "Tab") e.preventDefault() }}
            {...InputProps}
          />
        </div>
      )}
    </div>
  );
});

export default EditableColumn;
