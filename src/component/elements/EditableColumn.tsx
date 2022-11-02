import {
  CSSProperties,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import Input, { InputKeyboardEvent, InputProps } from './Input';

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

  const [enabled, enableEdit] = useState<boolean | undefined>();
  const [isValid, setValid] = useState<boolean>(true);

  useEffect(() => {
    enableEdit(editStatus);
  }, [editStatus]);

  useImperativeHandle(ref, () => ({
    startEdit: () => {
      enableEdit(true);
    },
    closeEdit: () => {
      enableEdit(false);
    },
  }));

  const mouseClickCallback = useCallback((e: MouseEvent) => {
    if (!(e.target as HTMLInputElement).classList.contains('editable-column')) {
      enableEdit(false);
      window.removeEventListener('mousedown', mouseClickCallback);
    }
  }, []);

  const startEditHandler = useCallback(() => {
    window.addEventListener('mousedown', mouseClickCallback);
    onEditStart(true);
    enableEdit(true);
  }, [mouseClickCallback, onEditStart]);

  const editHandler = useCallback(
    (event: InputKeyboardEvent) => {
      const valid = validate(event?.target.value);
      setValid(valid);

      // when press Enter or Tab
      if (valid && ['Enter', 'Tab'].includes(event.key)) {
        onSave(event);
        enableEdit(false);
      }
      // close edit mode if press Enter, Tab or Escape
      if (['Escape'].includes(event.key)) {
        enableEdit(false);
        window.removeEventListener('mousedown', mouseClickCallback);
      }
    },
    [mouseClickCallback, onSave, validate],
  );

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
        <div style={{ display: 'table-cell', verticalAlign: 'middle' }}>
          <Input
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
            onKeyUp={editHandler}
            {...InputProps}
          />
        </div>
      )}
    </div>
  );
});

export default EditableColumn;
