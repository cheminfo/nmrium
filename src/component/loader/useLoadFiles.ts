import type { ParsingOptions } from '@zakodium/nmrium-core';
import type { FileItem } from 'file-collection';
import { FileCollection } from 'file-collection';
import { useCallback } from 'react';

import { isMetaFile, parseMetaFile } from '../../data/parseMeta/index.js';
import { useCore } from '../context/CoreContext.js';
import type { Action } from '../context/DispatchContext.js';
import { useDispatch } from '../context/DispatchContext.js';
import { useLogger } from '../context/LoggerContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { useToaster } from '../context/ToasterContext.js';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature.js';

type Payload = Extract<Action, { type: 'LOAD_DROP_FILES' }>['payload'];

export function useLoadFiles(onOpenMetaInformation?: (file: File) => void) {
  const dispatch = useDispatch();
  const preferences = usePreferences();
  const { dispatch: dispatchPreferences, current: workspacePreferences } =
    preferences;
  const toaster = useToaster();
  const { logger } = useLogger();
  const experimentalFeatures = useCheckExperimentalFeature();
  const core = useCore();

  const dispatchPayload = useCallback(
    (payload: Omit<Payload, 'spectraColors' | 'defaultMoleculeSettings'>) => {
      const { nmriumState } = payload;
      const { spectraColors, defaultMoleculeSettings } = workspacePreferences;

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
        payload: { ...payload, spectraColors, defaultMoleculeSettings },
      });
    },
    [dispatch, dispatchPreferences, workspacePreferences],
  );

  const loadNmriumArchives = useCallback(
    async (file: File, parsingOptions: Partial<ParsingOptions>) => {
      const [nmriumState, aggregator] = await core.readNMRiumArchive(
        file.stream(),
        parsingOptions,
      );

      dispatchPayload({ nmriumState, aggregator, containsNmrium: true });
    },
    [core, dispatchPayload],
  );

  const loadFileCollection = useCallback(
    async (
      fileCollection: FileCollection,
      metaFile: FileItem | undefined,
      parsingOptions: Partial<ParsingOptions>,
    ) => {
      const parseMetaFileResult = metaFile
        ? await parseMetaFile(metaFile)
        : null;
      const { nmriumState, containsNmrium, selectorRoot } = await core.read(
        fileCollection,
        parsingOptions,
      );
      const resetSourceObject = containsNmrium;

      dispatchPayload({
        nmriumState,
        containsNmrium,
        parseMetaFileResult,
        fileCollection,
        selectorRoot,
        resetSourceObject,
      });
    },
    [core, dispatchPayload],
  );

  const currentPreferences = preferences.current;
  const loadUserFiles = useCallback(
    async (files: File[]) => {
      if (onOpenMetaInformation && files.length === 1 && isMetaFile(files[0])) {
        onOpenMetaInformation(files[0]);
        return;
      }

      const { onLoadProcessing } = workspacePreferences;
      const { nmrLoaders: selector } = currentPreferences;

      const parsingOptions: Partial<ParsingOptions> = {
        selector,
        logger: logger.child({ context: 'nmr-processing' }),
        onLoadProcessing,
        experimentalFeatures,
      };

      const groupedFiles = await groupFiles(files);
      const { nmriumArchiveFiles, fileCollection, metaFile } = groupedFiles;

      if (nmriumArchiveFiles.length > 0) {
        await Promise.all(
          nmriumArchiveFiles.map((file) =>
            loadNmriumArchives(file, parsingOptions),
          ),
        );
      }

      await loadFileCollection(fileCollection, metaFile, parsingOptions);
    },
    [
      experimentalFeatures,
      loadFileCollection,
      loadNmriumArchives,
      logger,
      onOpenMetaInformation,
      currentPreferences,
      workspacePreferences,
    ],
  );

  return useCallback(
    (files: File[]) => {
      dispatch({ type: 'SET_LOADING_FLAG', payload: { isLoading: true } });

      loadUserFiles(files)
        .catch((error: unknown) => {
          toaster.show({ message: (error as Error).message, intent: 'danger' });
          logger.error(error as Error);
        })
        .finally(() => {
          dispatch({ type: 'SET_LOADING_FLAG', payload: { isLoading: false } });
        });
    },
    [dispatch, loadUserFiles, logger, toaster],
  );
}

async function groupFiles(files: File[]) {
  const nmriumArchiveFiles: File[] = [];
  const otherFiles: File[] = [];

  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    const header = await file.slice(0, 128).arrayBuffer();

    if (FileCollection.isIum(header, 'chemical/x-nmrium+zip')) {
      nmriumArchiveFiles.push(file);
      continue;
    }

    otherFiles.push(file);
  }

  const fileCollection = await new FileCollection().appendFileList(otherFiles);
  const metaFile = Object.values(fileCollection.files).find((file) =>
    isMetaFile(file),
  );

  return { nmriumArchiveFiles, fileCollection, metaFile };
}
