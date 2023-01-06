/** @jsxImportSource @emotion/react */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { css } from '@emotion/react';
import { Formik, FormikProps } from 'formik';
import lodashGet from 'lodash/get';
import { parse, ParseError, ParseResult } from 'papaparse';
import { CSSProperties, useState, useMemo, useRef } from 'react';
import type { FileWithPath } from 'react-dropzone';
import { DropZone } from 'react-science/ui';
import * as Yup from 'yup';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/Button';
import CloseButton from '../../elements/CloseButton';
import Label from '../../elements/Label';
import ReactTable, { Column } from '../../elements/ReactTable/ReactTable';
import FormikInput from '../../elements/formik/FormikInput';
import FormikSelect from '../../elements/formik/FormikSelect';
import { useAlert } from '../../elements/popup/Alert/Context';
import { IMPORT_SPECTRA_META_INFO } from '../../reducer/types/Types';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus';
import { ModalStyles } from '../ModalStyle';

const styles: Record<'container' | 'column', CSSProperties> = {
  container: {
    width: '100%',
    flex: 1,
    overflow: 'hidden',
    border: 'none',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
  },
  column: {
    minWidth: '100px',
    maxWidth: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '0px',
  },
};

const rowColors = {
  match: {
    activated: {
      backgroundColor: '#d6ffe6',
      color: '#28ba62',
    },
    hover: {
      backgroundColor: '#2dd36f',
      color: 'white',
    },
  },
  noMatch: {
    activated: {
      backgroundColor: '#ffd6db',
      color: '#cf3c4f',
    },
    hover: {
      backgroundColor: '#eb445a',
      color: 'white',
    },
  },
};

interface CompareResultItem {
  key: string;
  isDuplicated: boolean;
  spectraIDs: string[];
}
type CompareResult = Record<number, CompareResultItem>;

interface MetaImportationModalProps {
  onClose?: () => void;
}

function castKey(val: string | number) {
  return String(val)
    .toLowerCase()
    .trim()
    .replace(/\r?\n|\r/, '');
}

const validationSchema = Yup.object({
  source: Yup.string().required(),
  target: Yup.string().required(),
});

function MetaImportationModal({ onClose }: MetaImportationModalProps) {
  const alert = useAlert();
  const dispatch = useDispatch();

  const formRef = useRef<FormikProps<any>>(null);
  const [parseResult, setParseResult] = useState<ParseResult<any>>();
  const [compareResults, setCompareResults] = useState<CompareResult>({});
  const [matches, setMatchesResults] = useState<Record<string, any>>({});

  const {
    data,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();

  function handleDrop(files: FileWithPath[]) {
    parse(files[0], {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        setParseResult(results);
      },
    });
  }

  const errors = mapError(parseResult?.errors || []);

  const metaData: ParseResult<any>['data'] = parseResult?.data || [];

  const columns = useMemo(() => {
    const fields = parseResult?.meta.fields || [];
    const columns: Column<any>[] = [
      { Header: '#', accessor: (_, index) => index + 1 },
    ];

    function getRowValue(val) {
      if (typeof val === 'string') return val;

      return val;
    }

    for (const fieldName of fields) {
      if (fieldName) {
        columns.push({
          Header: fieldName,
          accessor: (row) => getRowValue(row[fieldName]),
          style: styles.column,
        });
      }
    }
    return columns;
  }, [parseResult?.meta.fields]);

  function handleLinkSpectra(field) {
    const { source, target } = field;
    const targetValues: Record<string, string[]> = {};
    let isTargetPathExists = true;

    for (const spectrum of getSpectraByNucleus(activeTab, data)) {
      const value = lodashGet(spectrum, target, null);
      if (value === null) {
        isTargetPathExists = false;
        break;
      }

      if (['string', 'number'].includes(typeof value)) {
        const val = castKey(value);
        if (!targetValues[val]) {
          targetValues[val] = [spectrum.id];
        } else {
          targetValues[val].push(spectrum.id);
        }
      }
    }

    if (!isTargetPathExists) {
      alert.error(`Target field path [ ${target} ] is not exists`);
      formRef.current?.setFieldValue('target', null);
      formRef.current?.setFieldError('target', '');
    } else {
      const sourceValues = {};
      let index = 0;
      for (const metaRow of metaData) {
        const sourceValue = castKey(metaRow[source]);
        if (targetValues[sourceValue]) {
          if (!sourceValues[sourceValue]) {
            sourceValues[sourceValue] = [index];
          } else {
            sourceValues[sourceValue].push(index);
          }
        }
        index++;
      }

      const result: CompareResult = {};
      const matchesResults: Record<string, any> =
        {}; /** where the `key` is the spectra id and the `value` is the meta object  */

      for (const key in sourceValues) {
        for (const index of sourceValues[key]) {
          const isDuplicated = sourceValues[key].length > 1;
          result[index] = {
            key,
            isDuplicated,
            spectraIDs: targetValues[key],
          };
          if (!isDuplicated && targetValues[key].length === 1) {
            matchesResults[targetValues[key][0]] = parseResult?.data[index];
          }
        }
      }

      setMatchesResults(matchesResults);

      if (Object.keys(result).length > 0) {
        setCompareResults(result);
      } else {
        alert.error(
          `No matches found:  Source field [${source}] => Target field [${target}]`,
        );
      }
    }
  }

  function handleActiveRow(data) {
    const record = compareResults[data.index] || null;
    if (
      record?.isDuplicated ||
      record?.spectraIDs.length > 0 ||
      errors?.[data.index]
    ) {
      return true;
    }
    return false;
  }

  function handleRowStyle(data) {
    const record = compareResults[data.index] || null;
    if (
      record?.isDuplicated ||
      record?.spectraIDs.length > 1 ||
      errors?.[data.index]
    ) {
      return rowColors.noMatch;
    } else if (record) {
      return rowColors.match;
    }
  }

  function handleImport() {
    dispatch({
      type: IMPORT_SPECTRA_META_INFO,
      payload: { spectraMeta: matches },
    });
    onClose?.();
  }

  return (
    <div css={ModalStyles} style={{ overflow: 'hidden' }}>
      <div className="header handle">
        <span>Import Meta Information</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>

      <div style={styles.container}>
        <div style={{ flex: 1, width: '100%' }}>
          {!parseResult ? (
            <DropZone
              fileValidator={fileValidator}
              color="gray"
              emptyText="Drag and Drop CSV or tab-delimited file (.csv, .txt or .tsv)"
              onDrop={handleDrop}
            />
          ) : (
            <>
              <div style={{ height: '130px' }}>
                <Formik
                  innerRef={formRef}
                  initialValues={{
                    source: null,
                    target: null,
                  }}
                  onSubmit={handleLinkSpectra}
                  validationSchema={validationSchema}
                >
                  <>
                    <Label
                      title="Source field"
                      style={{ label: { width: '100px' } }}
                    >
                      <FormikSelect
                        name="source"
                        items={mapColumnToSelectItems(
                          parseResult?.meta.fields || [],
                        )}
                        style={{
                          width: '300px',
                          padding: '3px',
                          margin: 0,
                        }}
                      />
                    </Label>
                    <Label
                      title="Target field path"
                      style={{
                        label: { width: '100px', padding: '20px 0px' },
                      }}
                    >
                      <FormikInput
                        name="target"
                        style={{ input: { width: '300px', textAlign: 'left' } }}
                        placeholder="Example: info.plus"
                      />
                    </Label>
                  </>
                </Formik>
                <Button.Done onClick={() => formRef.current?.submitForm()}>
                  Link Spectra
                </Button.Done>
              </div>
              <div style={{ height: 'calc(100% - 160px)' }}>
                <ReactTable
                  columns={columns}
                  data={metaData}
                  approxItemHeight={25}
                  approxColumnWidth={100}
                  enableVirtualScroll
                  enableColumnsVirtualScroll
                  activeRow={handleActiveRow}
                  rowStyle={handleRowStyle}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="footer-container">
        <Button.Done
          onClick={handleImport}
          disabled={Object.keys(matches).length === 0}
        >
          Import
        </Button.Done>
      </div>
    </div>
  );
}

function fileValidator(file: File) {
  if (!['text/csv', 'text/tsv'].includes(file?.type)) {
    return {
      message: 'import a CSV or tab-delimited file',
      code: 'file - not - allow',
    };
  }
  return null;
}

function mapColumnToSelectItems(fields) {
  const items: any[] = [{ value: null, label: 'Select source field' }];

  for (const fieldName of fields) {
    if (fieldName) {
      items.push({ value: fieldName, label: fieldName });
    }
  }

  return items;
}

function mapError(errors: ParseError[]) {
  const result = {};
  for (const error of errors) {
    result[error.row] = error.message;
  }
  return result;
}

export default MetaImportationModal;
