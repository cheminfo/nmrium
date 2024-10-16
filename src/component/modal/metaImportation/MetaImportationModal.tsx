/** @jsxImportSource @emotion/react */
import { Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import type { ParseResult } from 'papaparse';
import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import type { FileError, FileWithPath } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { DropZone } from 'react-science/ui';
import * as Yup from 'yup';

import {
  isMetaFile,
  linkMetaWithSpectra,
  mapErrors,
  parseMetaFile,
  TargetPathError,
} from '../../../data/parseMeta/index.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import Button from '../../elements/Button.js';
import { Input2Controller } from '../../elements/Input2Controller.js';
import Label from '../../elements/Label.js';
import ReactTable, { Column } from '../../elements/ReactTable/ReactTable.js';
import { Select2Controller } from '../../elements/Select2Controller.js';
import { convertPathArrayToString } from '../../utility/convertPathArrayToString.js';
import { getSpectraObjectPaths } from '../../utility/getSpectraObjectPaths.js';

import { mapColumnToSelectItems } from './utils/mapColumnToSelectItems.js';

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

interface ImportLinkItem {
  source: string;
  target: string[];
}

const validationSchema = Yup.object({
  source: Yup.string().required(),
  target: Yup.array(Yup.string().required()).min(1).required(),
});

interface InnerMetaImportationModalPropsProps {
  file?: File;
  onCloseDialog: () => void;
}
interface MetaImportationModalPropsProps
  extends InnerMetaImportationModalPropsProps {
  isOpen: boolean;
}

export function MetaImportationModal(props: MetaImportationModalPropsProps) {
  const { isOpen, onCloseDialog, file } = props;

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen
      title="Import meta information"
      style={{ width: 900, height: 600 }}
      onClose={onCloseDialog}
    >
      <InnerMetaImportationModal {...{ onCloseDialog, file }} />
    </Dialog>
  );
}

function InnerMetaImportationModal({
  file,
  onCloseDialog,
}: InnerMetaImportationModalPropsProps) {
  const toaster = useToaster();
  const dispatch = useDispatch();
  const [parseResult, setParseResult] = useState<ParseResult<any> | null>();
  const [compareResults, setCompareResults] = useState<CompareResult>({});
  const [matches, setMatchesResults] = useState<Record<string, any>>({});

  const { data } = useChartData();
  const { datalist, paths } = getSpectraObjectPaths(data);

  function handleParseFile(file: FileWithPath | File) {
    void (async () => {
      const results = await parseMetaFile(file);
      setParseResult(results);
    })();
  }

  const { handleSubmit, control, setValue } = useForm<ImportLinkItem>({
    defaultValues: {
      source: '',
      target: [],
    },
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (file) {
      handleParseFile(file);
    }
    return () => {
      setParseResult(null);
    };
  }, [file]);

  function handleDrop(files: FileWithPath[]) {
    if (files[0]) {
      handleParseFile(files[0]);
    }
  }

  const errors = mapErrors(parseResult?.errors || []);

  const metaData: ParseResult<any>['data'] = parseResult?.data || [];

  const columns = useMemo(() => {
    const fields = parseResult?.meta.fields || [];
    const columns: Column[] = [
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

  function handleLinkSpectra(fields) {
    const { source, target } = fields;
    if (data && parseResult) {
      try {
        const { compareResult, matches } = linkMetaWithSpectra({
          source,
          target,
          spectra: data,
          parseMetaFileResult: parseResult,
        });
        setMatchesResults(matches);
        if (Object.keys(compareResult).length > 0) {
          setCompareResults(compareResult);
        } else {
          toaster.show({
            message: `No matches found:  Source field [${source}] => Target field [${target}]`,
            intent: 'danger',
          });
        }
      } catch (error: any) {
        if (error instanceof TargetPathError) {
          setValue('target', []);
        }
        toaster.show({
          message: error.message,
          intent: 'danger',
        });
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
      type: 'IMPORT_SPECTRA_META_INFO',
      payload: { spectraMeta: matches },
    });
    onCloseDialog?.();
  }

  return (
    <>
      <DialogBody>
        <div
          style={{ width: '100%', height: '100%' }}
          onDrop={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
        >
          {!parseResult ? (
            <DropZone
              validator={fileValidator}
              emptyDescription="Drag and Drop CSV or tab-delimited file (.csv, .txt or .tsv)"
              onDrop={handleDrop}
              noDragEventsBubbling
            />
          ) : (
            <>
              <div style={{ height: '130px' }}>
                <Label
                  title="Source field"
                  style={{ label: { width: '100px' } }}
                >
                  <Select2Controller
                    control={control}
                    name="source"
                    items={mapColumnToSelectItems(
                      parseResult?.meta.fields || [],
                    )}
                    filterable
                    selectedButtonProps={{ style: { minWidth: '200px' } }}
                  />
                </Label>
                <Label
                  title="Target field path"
                  style={{
                    label: { width: '100px', padding: '20px 0px' },
                  }}
                >
                  <Input2Controller
                    control={control}
                    name="target"
                    placeholder="Example: info.plus"
                    filterItems={datalist}
                    mapOnChangeValue={(key) => paths?.[key] || key}
                    mapValue={convertPathArrayToString}
                    style={{ minWidth: '200px' }}
                  />
                </Label>
                <Button.Done onClick={() => handleSubmit(handleLinkSpectra)()}>
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
      </DialogBody>
      <DialogFooter>
        <Button.Done
          onClick={handleImport}
          disabled={Object.keys(matches).length === 0}
        >
          Import
        </Button.Done>
      </DialogFooter>
    </>
  );
}

function fileValidator(file: File): FileError | null {
  if (!isMetaFile(file)) {
    return {
      message: 'import a CSV or tab-delimited file',
      code: 'file - not - allow',
    };
  }
  return null;
}
