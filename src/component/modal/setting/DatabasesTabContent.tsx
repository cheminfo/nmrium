import { v4 } from '@lukeed/uuid';
import { Field, useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { CSSProperties } from 'react';
import { FaLink, FaPlus, FaTimes } from 'react-icons/fa';

import { NMRiumWorkspace } from '../../NMRium';
import Button from '../../elements/Button';
import { GroupPane } from '../../elements/GroupPane';
import FormikCheckBox from '../../elements/formik/FormikCheckBox';
import FormikInput from '../../elements/formik/FormikInput';
import { getPreferencesByWorkspace } from '../../reducer/preferences/utilities/getPreferencesByWorkspace';
import { isGoogleDocument } from '../../utility/isGoogleDocument';

const style: Record<
  'table' | 'th' | 'input' | 'labelCol' | 'serialCol' | 'checkbox',
  CSSProperties
> = {
  table: {
    width: '100%',
  },
  th: {
    fontSize: '12px',
  },
  input: {
    width: '100%',
  },
  labelCol: {
    width: '30%',
  },
  serialCol: {
    width: '5%',
  },
  checkbox: {
    display: 'block',
    margin: '0 auto',
    width: 'fit-content',
  },
};

interface DatabasesTabContentProps {
  currentWorkspace: NMRiumWorkspace;
}

function DatabasesTabContent({ currentWorkspace }: DatabasesTabContentProps) {
  const { values, setFieldValue } = useFormikContext();

  const databases = lodashGet(values, 'databases', []);

  function deleteHandler(index: number) {
    const _database = databases.data.slice();
    _database.splice(index, 1);
    setFieldValue('databases.data', _database);
  }

  function addHandler() {
    const newDatabase = {
      key: v4(),
      label: '',
      url: '',
      enabled: true,
    };
    setFieldValue('databases.data', [...databases.data, newDatabase]);
  }

  function resetHandler() {
    const workSpaceDisplayPreferences =
      getPreferencesByWorkspace(currentWorkspace);
    const database = workSpaceDisplayPreferences.databases.data;

    setFieldValue('databases.data', database);
  }

  return (
    <fieldset
      onClick={(e: any) => {
        if (e.target.checked) {
          e.target.checked = false;
          setFieldValue('databases.defaultDatabase', '');
        }
      }}
    >
      <GroupPane
        text="Databases"
        renderHeader={(text) => {
          return (
            <DataBaseHeader
              text={text}
              onReset={resetHandler}
              onAdd={addHandler}
            />
          );
        }}
      >
        <table style={style.table}>
          <thead>
            <tr>
              <th style={style.th}>#</th>
              <th style={style.th}>Label </th>
              <th style={style.th}>URL</th>
              <th style={style.th}>Enabled</th>
              <th style={style.th}>Auto Load</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {databases?.data.map((item, index) => {
              const num = index + 1;
              return (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={`${index}`} style={{ height: '33px' }}>
                  <td style={style.serialCol}>
                    <span>{num}</span>{' '}
                  </td>
                  <td style={style.labelCol}>
                    <FormikInput
                      style={{ input: style.input }}
                      name={`databases.data.${index}.label`}
                      checkErrorAfterInputTouched={false}
                    />
                  </td>
                  <td>
                    <FormikInput
                      style={{ input: style.input }}
                      name={`databases.data.${index}.url`}
                      checkErrorAfterInputTouched={false}
                    />
                  </td>
                  <td>
                    <FormikCheckBox
                      style={{
                        container: style.checkbox,
                      }}
                      className="checkbox-element"
                      name={`databases.data.${index}.enabled`}
                    />
                  </td>
                  <td>
                    <Field
                      style={style.checkbox}
                      type="radio"
                      name="databases.defaultDatabase"
                      value={item.key}
                    />
                  </td>
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        height: '100%',
                      }}
                    >
                      <Button.Danger
                        style={{ fontSize: '14px' }}
                        fill="clear"
                        onClick={() => deleteHandler(index)}
                      >
                        <FaTimes />
                      </Button.Danger>

                      {databases.length === index + 1 && (
                        <Button.Done
                          fill="clear"
                          style={{ fontSize: '14px' }}
                          onClick={addHandler}
                        >
                          <FaPlus />
                        </Button.Done>
                      )}
                      {isGoogleDocument(item.url) && (
                        <Button.Action
                          style={{ fontSize: '13px' }}
                          fill="clear"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          <FaLink />
                        </Button.Action>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GroupPane>
    </fieldset>
  );
}

function DataBaseHeader({ onReset, onAdd, text }) {
  return (
    <div className="section-header" style={{ display: 'flex' }}>
      <p style={{ flex: 1 }}>{text}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button.Danger
          fill="clear"
          size="xSmall"
          onClick={onReset}
          style={{ margin: '0 5px' }}
        >
          Reset Databases
        </Button.Danger>
        <Button.Done fill="outline" size="xSmall" onClick={onAdd}>
          Add Database
        </Button.Done>
      </div>
    </div>
  );
}

export default DatabasesTabContent;
