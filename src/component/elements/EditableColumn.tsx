import {
  CSSProperties,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import Input from './Input';

interface EditableColumnProps {
  onSave?: (element: any) => void;
  onEditStart?: (element: any) => void;
  type?: 'number' | 'text';
  editStatus?: boolean;
  value: string | number;
  style?: CSSProperties;
}

// TODO: remove this hacky ref usage.
function EditableColumn(props: EditableColumnProps, ref: any) {
  const {
    onSave = () => null,
    value,
    type = 'text',
    style,
    onEditStart = () => null,
    editStatus = false,
  } = props;

  const [enabled, enableEdit] = useState<boolean | undefined>();

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

  const editModeHandler = useCallback(
    (flag, event = null) => {
      if (!flag) {
        // when press Enter or Tab
        if (['Enter', 'Tab'].includes(event.key)) {
          onSave(event);
        }
        // close edit mode if press Enter, Tab or Escape
        if (['Enter', 'Tab', 'Escape'].includes(event.key)) {
          enableEdit(flag);
          window.removeEventListener('mousedown', mouseClickCallback);
        }
      } else {
        // start edit mode and add mouse listener to handle mouse click outside the input to finish the mode
        window.addEventListener('mousedown', mouseClickCallback);
        onEditStart(event);
        enableEdit(flag);
      }
    },
    [mouseClickCallback, onEditStart, onSave],
  );

  return (
    <div
      style={{ display: 'table', width: '100%', height: '100%', ...style }}
      onDoubleClick={(event) => editModeHandler(true, event)}
    >
      {!enabled && (
        <span style={{ display: 'table-cell', verticalAlign: 'middle' }}>
          {value}
        </span>
      )}
      {enabled && (
        <div style={{ display: 'table-cell', verticalAlign: 'middle' }}>
          <Input
            enableAutoSelect
            className="editable-column"
            value={value}
            type={type}
            onKeyDown={(e) => editModeHandler(false, e)}
          />
        </div>
      )}
    </div>
  );
}

export default forwardRef(EditableColumn);
