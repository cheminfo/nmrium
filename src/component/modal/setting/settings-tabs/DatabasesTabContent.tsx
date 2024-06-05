/** @jsxImportSource @emotion/react */
import { Classes } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { v4 } from '@lukeed/uuid';
import { Field, useFormikContext } from 'formik';
import { CustomWorkspaces } from 'nmr-load-save';
import { CSSProperties, useCallback, useMemo } from 'react';
import { FaPlus, FaRegTrashAlt, FaLink } from 'react-icons/fa';
import { Button } from 'react-science/ui';

import { CheckBoxCell } from '../../../elements/CheckBoxCell';
import { GroupPane } from '../../../elements/GroupPane';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import { tableInputStyle } from '../../../elements/ReactTable/Style';
import FormikInput from '../../../elements/formik/FormikInput';
import type { NMRiumWorkspace } from '../../../main';
import { getPreferencesByWorkspace } from '../../../reducer/preferences/utilities/getPreferencesByWorkspace';
import { isGoogleDocument } from '../../../utility/isGoogleDocument';

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
  originalWorkspaces: CustomWorkspaces;
}

function DatabasesTabContent({
  currentWorkspace,
  originalWorkspaces,
}: DatabasesTabContentProps) {
  const { values, setFieldValue } = useFormikContext();
  const databases = (values as any).databases?.data || [];

  const addHandler = useCallback(
    (data: readonly any[], index = 0) => {
      let databases: any[] = [];
      const emptyField = {
        key: v4(),
        label: '',
        url: '',
        enabled: true,
      };
      if (data && Array.isArray(data)) {
        databases = [...data.slice(0, index), emptyField, ...data.slice(index)];
      } else {
        databases.push(emptyField);
      }
      void setFieldValue('databases.data', databases);
    },
    [setFieldValue],
  );

  const deleteHandler = useCallback(
    (data, index: number) => {
      const databases = data.filter((_, columnIndex) => columnIndex !== index);
      void setFieldValue('databases.data', databases);
    },
    [setFieldValue],
  );

  const COLUMNS: Array<Column<any>> = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '25px', textAlign: 'center' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Label',
        style: { minWidth: '150px' },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`databases.data.${row.index}.label`}
              style={tableInputStyle}
            />
          );
        },
      },
      {
        Header: 'URL',
        style: { width: '100%' },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`databases.data.${row.index}.url`}
              style={tableInputStyle}
            />
          );
        },
      },
      {
        Header: 'Enabled',
        style: { width: '30px' },
        Cell: ({ row }) => (
          <CheckBoxCell
            name={`databases.data.${row.index}.enabled`}
            defaultValue
          />
        ),
      },
      {
        Header: 'Auto Load',
        style: { width: '30px' },
        Cell: ({ row }) => (
          <Field
            style={style.checkbox}
            type="radio"
            name="databases.defaultDatabase"
            value={row.original.key}
          />
        ),
      },
      {
        Header: '',
        style: { maxWidth: '100px', width: '85px' },
        id: 'add-button',
        Cell: ({ data, row }) => {
          const { index, original: record } = row;
          return (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                padding: '0 3px',
              }}
            >
              <Button
                small
                outlined
                intent="danger"
                tooltipProps={{ content: '', disabled: true }}
                onClick={() => deleteHandler(data, index)}
              >
                <FaRegTrashAlt className={Classes.ICON} />
              </Button>

              <Button
                small
                intent="success"
                outlined
                tooltipProps={{ content: '', disabled: true }}
                onClick={() => addHandler(data, index + 1)}
                css={css`
                  margin: 0 3px;
                `}
              >
                <FaPlus className={Classes.ICON} />
              </Button>

              {isGoogleDocument(record.url) && (
                <Button
                  small
                  outlined
                  intent="primary"
                  onClick={() => window.open(record.url, '_blank')}
                  tooltipProps={{ content: 'Open document', compact: true }}
                >
                  <FaLink className={Classes.ICON} />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [addHandler, deleteHandler],
  );

  function resetHandler() {
    const workSpaceDisplayPreferences = getPreferencesByWorkspace(
      currentWorkspace,
      originalWorkspaces,
    );
    const database = workSpaceDisplayPreferences.databases.data;

    void setFieldValue('databases.data', database);
  }

  return (
    <fieldset
      onClick={(e: any) => {
        if (e.target.checked) {
          e.target.checked = false;
          void setFieldValue('databases.defaultDatabase', '');
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
              onAdd={() => addHandler(databases)}
            />
          );
        }}
      >
        <ReactTable
          style={{
            'thead tr th': { zIndex: 1 },
            td: { padding: 0 },
          }}
          rowStyle={{
            hover: { backgroundColor: '#f7f7f7' },
            active: { backgroundColor: '#f5f5f5' },
          }}
          data={databases}
          columns={COLUMNS}
          emptyDataRowText="No Fields"
        />
      </GroupPane>
    </fieldset>
  );
}

function DataBaseHeader({ onReset, onAdd, text }) {
  return (
    <div className="section-header" style={{ display: 'flex' }}>
      <p style={{ flex: 1 }}>{text}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          small
          minimal
          intent="danger"
          tooltipProps={{ content: '', disabled: true }}
          onClick={onReset}
        >
          Reset Databases
        </Button>

        <Button
          small
          outlined
          intent="success"
          tooltipProps={{ content: '', disabled: true }}
          onClick={onAdd}
        >
          Add Database
        </Button>
      </div>
    </div>
  );
}

export default DatabasesTabContent;
