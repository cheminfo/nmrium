import type { FifoLogger } from 'fifo-logger';
import lodashMergeWith from 'lodash/mergeWith.js';
import { useMemo } from 'react';
import type { z } from 'zod/v4';

import { useLogger } from '../../../../context/LoggerContext.tsx';
import { usePreferences } from '../../../../context/PreferencesContext.tsx';
import type { WorkspaceWithSource } from '../../../../reducer/preferences/preferencesReducer.ts';
import { workspaceDefaultProperties } from '../../../../workspaces/workspaceDefaultProperties.ts';
import {
  defaultGeneralSettingsFormValues,
  workspaceValidation,
} from '../validation.ts';

/**
 * Best effort to return typesafe values for the form
 * If one step does not work
 * - warn zod result with workspace in context
 * - fallback on the next step.
 *
 * 1. try to encode the current workspace
 * 2. try to encode the current workspace merged with workspaceDefaultProperties
 * 3. fallback on defaultGeneralSettingsFormValues (apply / save will lose current workspace values)
 *
 * NB: merge use a replacement array strategy.
 */
export function useDefaultValues() {
  const { current: currentWorkspace } = usePreferences();

  return useUnsafeWorkspaceToForm(currentWorkspace);
}

function useUnsafeWorkspaceToForm(
  potentialUnsafeWorkspace: WorkspaceWithSource,
) {
  const { logger } = useLogger();

  return useMemo(() => {
    return unsafeWorkspaceToForm(potentialUnsafeWorkspace, logger);
  }, [potentialUnsafeWorkspace, logger]);
}

export function unsafeWorkspaceToForm(
  potentialUnsafeWorkspace: WorkspaceWithSource,
  logger?: FifoLogger,
) {
  const result = workspaceValidation.safeEncode(potentialUnsafeWorkspace);
  if (result.success) return result.data;

  const childLogger = logger?.child({ workspace: potentialUnsafeWorkspace });

  childLogger?.warn(
    result,
    'Failed to encode current workspace, try to merge with current workspace default values',
  );
  const workspaceMergedWithDefault = lodashMergeWith(
    {},
    workspaceDefaultProperties,
    potentialUnsafeWorkspace,
    mergeReplaceArray,
  );
  const mergedResult = workspaceValidation.safeEncode(
    workspaceMergedWithDefault,
  );
  if (mergedResult.success) return mergedResult.data;

  childLogger?.warn(
    mergedResult,
    'Failed to encode workspace merged with default values, use current default values instead',
  );
  return defaultGeneralSettingsFormValues;
}

export function formValueToWorkspace(
  value: z.input<typeof workspaceValidation>,
  baseValue: WorkspaceWithSource,
): WorkspaceWithSource {
  const safeParseResult = workspaceValidation.safeParse(value);

  if (!safeParseResult.success) {
    throw new Error('Failed to parse workspace validation', {
      cause: safeParseResult.error,
    });
  }

  const safeValue = safeParseResult.data;
  return lodashMergeWith({}, baseValue, safeValue, mergeReplaceArray);
}

function mergeReplaceArray(obj: unknown, src: unknown) {
  if (!Array.isArray(obj)) return;
  if (!Array.isArray(src)) return;

  return src;
}
