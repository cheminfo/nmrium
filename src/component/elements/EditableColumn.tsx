import {
  CSSProperties,
  ChangeEvent,
  KeyboardEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import Input, { InputProps } from './Input';

function extractNumber(val: string | number, type: string) {
  if (type === 'number' && typeof val !== 'number') {
    return Number(val.replaceAll(/[^\d.-]/g, ''));
  }

  return val;
}

interface EditableColumnProps
  extends Omit<InputProps, 'style' | 'value' | 'type'> {
  onSave?: (element: KeyboardEvent<HTMLInputElement>) => void;
  onEditStart?: (element: boolean) => void;
  type?: 'number' | 'text';
  editStatus?: boolean;
  value: string | number;
  style?: CSSProperties;
  validate?: (value?: string | number) => boolean;
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
  const [val, setVal] = useState(extractNumber(value, type));
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

  function startEditHandler() {
    window.addEventListener('mousedown', mouseClickCallback);
    onEditStart(true);
    enableEdit(true);
  }

  function editHandler(event: KeyboardEvent<HTMLInputElement>) {
    const valid = validate(val);
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
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setVal(e.target.value);
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
            width: '100%',
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
                ...(!isValid && { borderColor: 'red' }),
                width: '100%',
              },
              input: {
                padding: '5px',
                width: '100%',
                minWidth: '60px',
              },
            }}
            autoSelect
            className="editable-column"
            value={val}
            type={type}
            onChange={handleChange}
            onKeyUp={editHandler}
            onMouseDown={(e) => e.stopPropagation()}
            {...InputProps}
          />
        </div>
      )}
    </div>
  );
});

export default EditableColumn;
