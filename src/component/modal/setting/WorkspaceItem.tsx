import { CSSProperties, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

import Button from '../../elements/Button';
import workspaces from '../../workspaces';

const styles: Record<
  'container' | 'item' | 'newContainer' | 'input',
  CSSProperties
> = {
  container: {
    display: 'flex',
  },
  item: {
    flex: '1',
    textAlign: 'left',
    fontSize: '11px',
    padding: '5px',
  },
  newContainer: {
    backgroundColor: '#f6f6f6',
    display: 'flex',
    padding: '0.3em',
  },
  input: {
    padding: '0.5em 0.8em',
    fontSize: '12px',
    color: 'black',
    outline: 'none',
    backgroundColor: 'transparent',
  },
};

function WorkspaceItem({ item, onSave, onDelete }) {
  const [name, setName] = useState<string>('');

  // Add new workspace
  function addHandler(e) {
    e.stopPropagation();
    setName('');
    onSave(name);
  }

  // bubble onDelete
  function deleteHandler(e) {
    e.stopPropagation();
    onDelete(item.key);
  }

  function onTextChange(e) {
    setName(e.target.value);
  }

  return (
    <div>
      {item.key === 'new' ? (
        <div style={styles.newContainer}>
          <input
            style={styles.input}
            value={name}
            placeholder="Custom workspace"
            onClick={(e) => e.stopPropagation()}
            onChange={onTextChange}
          />
          <Button.Done
            onClick={addHandler}
            disabled={!name}
            style={{ fontSize: '11px' }}
          >
            Save
          </Button.Done>
        </div>
      ) : (
        <div style={styles.container}>
          <span style={styles.item}>{item.label}</span>
          {!workspaces[item.key] && (
            <Button.Danger onClick={deleteHandler} size="xSmall" fill="clear">
              <FaTimes />
            </Button.Danger>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkspaceItem;
