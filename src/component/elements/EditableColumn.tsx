import {
  CSSProperties,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import { forwardRefWithAs } from '../../utils';

import Input from './Input';

interface EditableColumnProps {
  onSave?: (element: any) => void;
  onEditStart?: (element: any) => void;
  type?: 'number' | 'text';
  editStatus?: boolean;
  value: string;
  style?: CSSProperties;
}

function EditableColumn(props: EditableColumnProps, ref) {
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
      function mouseClickCallback(e: MouseEvent) {
        if (
          !(e.target as HTMLInputElement).classList.contains('editable-column')
        ) {
          enableEdit(false);
          window.removeEventListener('mousedown', mouseClickCallback);
        }
      }

      if (!flag) {
        window.removeEventListener('mousedown', mouseClickCallback);
        // 13 enter, 9 tab
        if ([13, 9].includes(event.keyCode)) {
          // when press Enter or Tab
          onSave(event);
          enableEdit(flag);
        } else if (event.keyCode === 27) {
          // when press Escape
          enableEdit(flag);
        }
      } else {
        window.addEventListener('mousedown', mouseClickCallback);
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

export default forwardRefWithAs(EditableColumn);
