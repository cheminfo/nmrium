/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { useCallback, useMemo } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

import { NMRiumWorkspace } from '../../NMRium';
import Button from '../../elements/Button';
import FormikCheckBox from '../../elements/formik/FormikCheckBox';
import FormikInput from '../../elements/formik/FormikInput';
import Workspaces from '../../workspaces';

const style = {
  addButton: css`
    background-color: transparent;
    border: 0;
    outline: none;
    margin-left: 5px;
    svg {
      font-size: 14px;
      fill: green;
    }
  `,
  table: {
    width: '100%',
  },
  th: {
    fontSize: '12px',
  },
  input: {
    input: { width: '100%' },
  },
  labelCol: {
    width: '30%',
  },
  serialCol: {
    width: '5%',
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
      const _database = databases.slice();
      _database.splice(index, 1);
      setFieldValue('databases', _database);
    },
    [databases, setFieldValue],
  );
  const addNewDatabaseHandler = useCallback(() => {
    const newDatabase = {
      label: '',
      url: '',
      enabled: true,
    };
    setFieldValue('databases', [...databases, newDatabase]);
  }, [databases, setFieldValue]);
  const resetDatabaseHandler = useCallback(() => {
    const database =
      Workspaces?.[currentWorkspace]?.databases || Workspaces.default.databases;

    setFieldValue('databases', database);
  }, [currentWorkspace, setFieldValue]);

  return (
    <>
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
              <th />
            </tr>
          </thead>
          <tbody>
            {databases?.map((item, index) => {
              const num = index + 1;
              return (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={`${index}`} style={{ height: '33px' }}>
                  <td style={style.serialCol}>
                    <span>{num}</span>{' '}
                  </td>
                  <td style={style.labelCol}>
                    <FormikInput
                      style={style.input}
                      name={`databases.${index}.label`}
                      checkErrorAfterInputTouched={false}
                    />
                  </td>
                  <td>
                    <FormikInput
                      style={style.input}
                      name={`databases.${index}.url`}
                      checkErrorAfterInputTouched={false}
                    />
                  </td>
                  <td>
                    <FormikCheckBox
                      style={{
                        container: {
                          display: 'block',
                          margin: '0 auto',
                          width: 'fit-content',
                        },
                      }}
                      className="checkbox-element"
                      name={`databases.${index}.enabled`}
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
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default DatabasesTabContent;
