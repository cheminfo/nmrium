import { fileCollectionFromFileList } from 'filelist-utils';
import { read as readDropFiles } from 'nmr-load-save';
import { ParseResult } from 'papaparse';
import { useCallback } from 'react';

import { isMetaFile, parseMetaFile } from '../../data/parseMeta/index.js';
import { useDispatch } from '../context/DispatchContext.js';
import { useLogger } from '../context/LoggerContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { useToaster } from '../context/ToasterContext.js';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature.js';

export function useLoadFiles(onOpenMetaInformation?: (file: File) => void) {
  const dispatch = useDispatch();
  const { dispatch: dispatchPreferences, current: workspacePreferences } =
    usePreferences();
  const preferences = usePreferences();
  const toaster = useToaster();
  const { logger } = useLogger();
  const experimentalFeatures = useCheckExperimentalFeature();

  return useCallback(
    (files: File[]) => {
      dispatch({ type: 'SET_LOADING_FLAG', payload: { isLoading: true } });

      async function loadFiles(files) {
        if (
          onOpenMetaInformation &&
          files.length === 1 &&
          isMetaFile(files[0])
        ) {
          onOpenMetaInformation(files[0]);
        } else {
          const fileCollection = await fileCollectionFromFileList(files);
          const metaFile = Object.values(fileCollection.files).find((file) =>
            isMetaFile(file),
          );
          let parseMetaFileResult: ParseResult<any> | null = null;
          if (metaFile) {
            parseMetaFileResult = await parseMetaFile(metaFile);
          }
          const { nmrLoaders: sourceSelector } = preferences.current;
          const { onLoadProcessing, spectraColors } = workspacePreferences;
          const { nmriumState, containsNmrium } = await readDropFiles(
            fileCollection,
            {
              sourceSelector,
              logger: logger.child({ context: 'nmr-processing' }),
              onLoadProcessing,
              experimentalFeatures,
            },
          );

          if ((nmriumState as any)?.settings) {
            dispatchPreferences({
              type: 'SET_WORKSPACE',
              payload: {
                data: (nmriumState as any).settings,
                workspaceSource: 'nmriumFile',
              },
            });
          }
          dispatch({
            type: 'LOAD_DROP_FILES',
            payload: {
              nmriumState,
              containsNmrium,
              parseMetaFileResult,
              spectraColors,
            },
          });
        }
      }

      loadFiles(files)
        .catch((error: unknown) => {
          toaster.show({ message: (error as Error).message, intent: 'danger' });
          logger.error(error as Error);
        })
        .finally(() => {
          dispatch({ type: 'SET_LOADING_FLAG', payload: { isLoading: false } });
        });
    },
    [
      dispatch,
      dispatchPreferences,
      experimentalFeatures,
      logger,
      onOpenMetaInformation,
      preferences,
      toaster,
      workspacePreferences,
    ],
  );
}
