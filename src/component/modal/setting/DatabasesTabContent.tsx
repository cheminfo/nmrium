import { Field, useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { CSSProperties, useCallback, useMemo } from 'react';
import { FaLink, FaPlus, FaTimes } from 'react-icons/fa';

import generateID from '../../../data/utilities/generateID';
import { NMRiumWorkspace } from '../../NMRium';
import Button from '../../elements/Button';
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

  const databases = useMemo(() => lodashGet(values, 'databases', []), [values]);

  const deleteHandler = useCallback(
    (index: number) => {
      const _database = databases.data.slice();
      _database.splice(index, 1);
      setFieldValue('databases.data', _database);
    },
    [databases, setFieldValue],
  );
  const addNewDatabaseHandler = useCallback(() => {
    const newDatabase = {
      key: generateID(),
      label: '',
      url: '',
      enabled: true,
    };
    setFieldValue('databases.data', [...databases.data, newDatabase]);
  }, [databases, setFieldValue]);

  const resetDatabaseHandler = useCallback(() => {
    const workSpaceDisplayPreferences =
      getPreferencesByWorkspace(currentWorkspace);
    const database = workSpaceDisplayPreferences.databases.data;

    setFieldValue('databases.data', database);
  }, [currentWorkspace, setFieldValue]);

  return (
    <fieldset
      onClick={(e: any) => {
        if (e.target.checked) {
          e.target.checked = false;
          setFieldValue('databases.defaultDatabase', '');
        }
      }}
    >
      <div className="section-header" style={{ display: 'flex' }}>
        <p style={{ flex: 1 }}>Databases</p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button.Danger
            fill="clear"
            size="xSmall"
            onClick={resetDatabaseHandler}
            style={{ margin: '0 5px' }}
          >
            Reset Databases
          </Button.Danger>
          <Button.Done
            fill="outline"
            size="xSmall"
            onClick={addNewDatabaseHandler}
          >
            Add Database
          </Button.Done>
        </div>
      </div>
      <div>
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
                          onClick={addNewDatabaseHandler}
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
      </div>
    </fieldset>
  );
}

export default DatabasesTabContent;
