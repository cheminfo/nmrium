import { FileCollection } from 'file-collection';
import type { ParseResult } from 'papaparse';
import { useCallback } from 'react';

import { isMetaFile, parseMetaFile } from '../../data/parseMeta/index.js';
import { useCore } from '../context/CoreContext.js';
import { useDispatch } from '../context/DispatchContext.js';
import { useLogger } from '../context/LoggerContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { useToaster } from '../context/ToasterContext.js';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature.js';

export function useLoadFiles(onOpenMetaInformation?: (file: File) => void) {
  const dispatch = useDispatch();
  const preferences = usePreferences();
  const { dispatch: dispatchPreferences, current: workspacePreferences } =
    preferences;
  const toaster = useToaster();
  const { logger } = useLogger();
  const experimentalFeatures = useCheckExperimentalFeature();
  const core = useCore();

  return useCallback(
    (files: File[]) => {
      dispatch({ type: 'SET_LOADING_FLAG', payload: { isLoading: true } });

      async function loadFiles(files: File[]) {
        if (
          onOpenMetaInformation &&
          files.length === 1 &&
          isMetaFile(files[0])
        ) {
          onOpenMetaInformation(files[0]);
        } else {
          const fileCollection = await new FileCollection().appendFileList(
            files,
          );
          const metaFile = Object.values(fileCollection.files).find((file) =>
            isMetaFile(file),
          );
          let parseMetaFileResult: ParseResult<any> | null = null;
          if (metaFile) {
            parseMetaFileResult = await parseMetaFile(metaFile);
          }
          const { nmrLoaders: sourceSelector } = preferences.current;
          const { onLoadProcessing, spectraColors } = workspacePreferences;
          const { nmriumState, containsNmrium } = await core.read(
            fileCollection,
            {
              sourceSelector,
              logger: logger.child({ context: 'nmr-processing' }),
              onLoadProcessing,
              experimentalFeatures,
            },
          );

          if (nmriumState.settings) {
            dispatchPreferences({
              type: 'SET_WORKSPACE',
              payload: {
                data: nmriumState.settings,
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
              fileCollection,
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
      core,
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
