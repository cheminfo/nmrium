import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import Input from './Input';

const EditableColumn = forwardRef(function EditableColumn(
  { onSave, value, type, style, onEditStart, editStatus },
  ref,
) {
  const [enabled, enableEdit] = useState();
  const refInput = useRef();

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
      style={{ width: '100%', height: '100%', ...style }}
      onDoubleClick={(event) => editModeHandler(true, event)}
    >
      {!enabled && value}
      {enabled && (
        <Input
          enableAutoSelect
          ref={refInput}
          value={value}
          type={type}
          onKeyDown={(e) => editModeHandler(false, e)}
        />
      )}
    </div>
  );
});

EditableColumn.defaultProps = {
  onSave: () => null,
  onEditStart: () => null,
  type: 'text',
  editStatus: false,
};

export default EditableColumn;
