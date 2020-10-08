import React, { useCallback, useState } from 'react';

import Input from './Input';

const EditableColumn = ({ onSave, value, type = 'text', style }) => {
  const [enabled, enableEdit] = useState(false);

  const editModeHandler = useCallback(
    (flag, event = null) => {
      if (event && flag === false) {
        if (event.keyCode === 13) {
          // when press Enter
          onSave(event);
          enableEdit(flag);
        } else if (event.keyCode === 27) {
          // when press Escape
          enableEdit(flag);
        }
      } else {
        enableEdit(flag);
      }
    },
    [onSave],
  );

  return (
    <div
      style={{ width: '100%', height: '100%', ...style }}
      onDoubleClick={() => editModeHandler(true)}
    >
      {!enabled && value}
      {enabled && (
        <Input
          value={value}
          type={type}
          onKeyDown={(e) => editModeHandler(false, e)}
        />
      )}
    </div>
  );
};

export default EditableColumn;
