/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useState } from 'react';

import workspaces from '../../workspaces';

const styles = css`
  .container {
    display: flex;
    span {
      padding: 5px !important;
    }
    span {
      flex: 1;
      text-align: left !important;
    }
  }

  .new-container {
    background-color: #f6f6f6;
    display: flex;
    padding: 0.3em;

    input {
      padding: 0.5em;
      color: black;
      outline: none;
      background-color: transparent !important;
    }
  }

  .delete-button:hover {
    color: white;
  }

  .save-button:hover {
    color: green;
  }
  .delete-button,
  .save-button {
    padding: 5px;
  }
`;

const WorkspaceItem = ({ item, onSave, onDelete }) => {
  const [name, setName] = useState<string>('');
  const addWorkspaceHandler = useCallback(
    (e) => {
      e.stopPropagation();
      setName('');
      onSave(name);
    },
    [name, onSave],
  );

  const deleteWorkspaceHandler = useCallback(
    (e) => {
      e.stopPropagation();
      onDelete(item.key);
    },
    [item.key, onDelete],
  );

  const onTextChange = useCallback((e) => {
    setName(e.target.value);
  }, []);

  return (
    <div css={styles}>
      {item.key === 'new' ? (
        <div className="new-container">
          <input
            value={name}
            placeholder="Custom workspace"
            onClick={(e) => e.stopPropagation()}
            onChange={onTextChange}
          />
          <button
            type="button"
            className="save-button"
            onClick={addWorkspaceHandler}
            disabled={!name}
          >
            save
          </button>
        </div>
      ) : (
        <div className="container">
          <span>{item.label}</span>
          {!workspaces[item.key] && (
            <button
              type="button"
              className="delete-button"
              onClick={deleteWorkspaceHandler}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkspaceItem;
