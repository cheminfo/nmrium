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
  value: string;
  style?: CSSProperties;
}

const EditableColumn = forwardRef(function EditableColumn(
  props: EditableColumnProps,
  ref,
) {
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

  const editModeHandler = useCallback(
    (flag, event = null) => {
      if (!flag) {
        if (event.keyCode === 13) {
          // when press Enter
          onSave(event);
          enableEdit(flag);
        } else if (event.keyCode === 27) {
          // when press Escape
          enableEdit(flag);
        }
      } else {
        onEditStart(event);
        enableEdit(flag);
      }
    },
    [onEditStart, onSave],
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
            value={value}
            type={type}
            onKeyDown={(e) => editModeHandler(false, e)}
          />
        </div>
      )}
    </div>
  );
});

export default EditableColumn;
