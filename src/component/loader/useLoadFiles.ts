import type { NmriumState, ParsingOptions } from '@zakodium/nmrium-core';
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
          return;
        }

        const nmriumArchiveFiles: File[] = [];
        const otherFiles: File[] = [];
        let nmriumState: Partial<NmriumState>;
        let containsNmrium: boolean;
        let parseMetaFileResult: ParseResult<any> | null = null;
        const { onLoadProcessing, spectraColors } = workspacePreferences;
        const { nmrLoaders: selector } = preferences.current;

        const parsingOptions: Partial<ParsingOptions> = {
          selector,
          logger: logger.child({ context: 'nmr-processing' }),
          onLoadProcessing,
          experimentalFeatures,
        };

        let aggregator: FileCollection | undefined;
        let fileCollection: FileCollection | undefined;
        let selectorRoot: string | undefined;
        let resetSourceObject = false;

        if (files.length === 1 && files[0].name.endsWith('.nmrium.zip')) {
          const [state, ium] = await core.readNMRiumArchive(
            files[0].stream(),
            parsingOptions,
          );
          nmriumState = state;
          containsNmrium = true;
          aggregator = ium;
        } else {
          for (const file of files) {
            if (file.name.endsWith('.nmrium.zip')) {
              nmriumArchiveFiles.push(file);
            } else {
              otherFiles.push(file);
            }
          }

          if (nmriumArchiveFiles.length > 0) {
            await Promise.all(
              nmriumArchiveFiles.map((file) => loadFiles([file])),
            );
          }

          fileCollection = await new FileCollection().appendFileList(
            otherFiles,
          );

          const metaFile = Object.values(fileCollection.files).find((file) =>
            isMetaFile(file),
          );

          if (metaFile) {
            parseMetaFileResult = await parseMetaFile(metaFile);
          }
          ({ nmriumState, containsNmrium, selectorRoot } = await core.read(
            fileCollection,
            parsingOptions,
          ));
          if (containsNmrium) {
            resetSourceObject = true;
          }
        }

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
            aggregator,
            fileCollection,
            selectorRoot,
            resetSourceObject,
          },
        });
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
