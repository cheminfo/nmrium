import { CSSProperties, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

import { usePreferences } from '../../context/PreferencesContext';
import Button from '../../elements/Button';
import workspaces from '../../workspaces';

const styles: Record<
  | 'container'
  | 'workspaceName'
  | 'workspaceVersion'
  | 'readOnly'
  | 'newContainer'
  | 'input',
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
    fontSize: '11px',
    padding: '5px',
  },
  workspaceVersion: {
    fontSize: '9px',
    padding: '5px',
  },
  readOnly: {
    fontSize: '10px',
    padding: '0 3px',
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

function WorkspaceItem({ item, onSave, onDelete }) {
  const [name, setName] = useState<string>('');
  const { customWorkspaces, workspacesTempKeys } = usePreferences();
  const readOnlyWorkspaces = Object.values(workspacesTempKeys);
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
          <WorkSpaceIndicator workspaceKey={item.key} />
          <span style={styles.workspaceName}>{item.label}</span>
          {readOnlyWorkspaces.includes(item.key) && (
            <span style={styles.readOnly}>Read Only</span>
          )}
          {!workspaces[item.key] &&
            !customWorkspaces[item.key] &&
            !readOnlyWorkspaces.includes(item.key) && (
              <Button.Danger onClick={deleteHandler} size="xSmall" fill="clear">
                <FaTimes />
              </Button.Danger>
            )}
          {item.version && !item.isReadOnly && (
            <span style={styles.workspaceVersion}>V{item.version}</span>
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

const WorkSpaceIndicator = (props) => {
  const { customWorkspaces, workspacesTempKeys } = usePreferences();
  let letter = 'U';
  let backgroundColor = '#ff6f00';

  if (customWorkspaces[props.workspaceKey]) {
    letter = 'C';
    backgroundColor = '#ffbe05';
  } else if (workspaces[props.workspaceKey]) {
    letter = 'P';
    backgroundColor = '#2dd36f';
  } else if (
    workspacesTempKeys.componentPreferencesKey === props.workspaceKey
  ) {
    letter = 'NC';
    backgroundColor = '#cccccc';
  } else if (workspacesTempKeys.nmriumWorkspaceKey === props.workspaceKey) {
    letter = 'NF';
    backgroundColor = '#cccccc';
  }

  return (
    <div style={{ ...style, backgroundColor }}>
      <span style={{ fontWeight: 'bolder' }}>{letter}</span>
    </div>
  );
};

export default WorkspaceItem;
