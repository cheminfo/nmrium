import type { WorkSpaceSource } from 'nmr-load-save';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { Button } from 'react-science/ui';

const styles: Record<
  'container' | 'workspaceName' | 'readOnly' | 'newContainer' | 'input',
  CSSProperties
> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 5px',
  },
  workspaceName: {
    flex: '1',
    textAlign: 'left',
    fontSize: '12px',
    padding: '0.5rem',
  },
  readOnly: {
    fontSize: '9px',
    padding: '0 5px',
    border: '1px solid #00d5ff',
    borderRadius: '10px',
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
    flex: 1,
  },
};

interface WorkspaceItemProps {
  item: any;
  onSave?: (name: string) => void;
  onDelete?: (key: string) => void;
}

function WorkspaceItem({ item, onSave, onDelete }: WorkspaceItemProps) {
  const [name, setName] = useState<string>('');
  // Add new workspace
  function addHandler(e) {
    e.stopPropagation();
    setName('');
    onSave?.(name);
  }

  // bubble onDelete
  function deleteHandler(e) {
    e.stopPropagation();
    onDelete?.(item.key);
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
          <Button
            intent="success"
            onClick={addHandler}
            disabled={!name}
            style={{ fontSize: '11px' }}
          >
            Save
          </Button>
        </div>
      ) : (
        <div style={styles.container}>
          <WorkSpaceIndicator source={item.source} />
          <span style={styles.workspaceName}>{item.label}</span>
          {item.source !== 'user' && (
            <span style={styles.readOnly}>Read Only</span>
          )}
          {item.source === 'user' && onDelete && (
            <Button
              minimal
              intent="danger"
              onClick={deleteHandler}
              small
              icon="cross"
            />
          )}
        </div>
      )}
    </div>
  );
}

const style = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const WorkSpaceIndicator = (props: { source: WorkSpaceSource }) => {
  let letter = '';
  let backgroundColor = 'red';

  switch (props.source) {
    case 'predefined':
      letter = 'P';
      backgroundColor = '#2dd36f';

      break;
    case 'custom':
      letter = 'C';
      backgroundColor = '#ffbe05';

      break;

    case 'component':
      letter = 'NC';
      backgroundColor = '#cccccc';

      break;

    case 'nmriumFile':
      letter = 'NF';
      backgroundColor = '#cccccc';
      break;

    case 'user':
      letter = 'U';
      backgroundColor = '#ff6f00';
      break;

    default:
      break;
  }

  return (
    <div style={{ ...style, backgroundColor }}>
      <span style={{ fontWeight: 'bolder' }}>{letter}</span>
    </div>
  );
};

export default WorkspaceItem;
