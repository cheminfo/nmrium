import { z } from 'zod';

import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties.js';

import { autoProcessingTabValidation } from './validation/auto_processing_tab_validation.ts';
import { databasesValidation } from './validation/database_tab_validation.ts';
import { exportPreferencesValidation } from './validation/export_tab_validation.js';
import { externalAPIsValidation } from './validation/external_apis_validation.js';
import {
  displayGeneralValidation,
  generalValidation,
  peaksLabelValidation,
} from './validation/general_tab_validation.js';
import { nmrLoadersValidation } from './validation/import_filters_tab_validation.js';
import { nucleiValidation } from './validation/nuclei_tab_validation.js';
import { displayPanelsValidation } from './validation/panels_tab_validation.js';
import { spectraColorsTabValidation } from './validation/spectra_colors_tab_validation.ts';
import { infoBlockTabValidation } from './validation/title_block_tab_validation.js';
import { toolBarButtonsValidation } from './validation/tools_tab_validation.ts';

/**
 * The type for the workspace preferences is `WorkspaceWithSource`
 * The form save / apply actions merge current workspace values with form values.
 *
 * @see {import('../../reducer/preferences/preferencesReducer.ts').WorkspaceWithSource}
 */

const displayValidation = z.object({
  general: displayGeneralValidation,
  panels: displayPanelsValidation,
  toolBarButtons: toolBarButtonsValidation,
});

export const workspaceValidation = z.object({
  display: displayValidation,
  general: generalValidation,
  nuclei: nucleiValidation,
  databases: databasesValidation,
  nmrLoaders: nmrLoadersValidation,
  infoBlock: infoBlockTabValidation,
  onLoadProcessing: autoProcessingTabValidation,
  spectraColors: spectraColorsTabValidation,
  externalAPIs: externalAPIsValidation,
  export: exportPreferencesValidation,
  peaksLabel: peaksLabelValidation,
});

// This object is used to define type not real values. Do not use it as values
export const defaultGeneralSettingsFormValues: z.input<
  typeof workspaceValidation
> = workspaceValidation.encode(workspaceDefaultProperties);
