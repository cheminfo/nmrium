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

/**
 * The type for the workspace preferences is `WorkspaceWithSource`
 * The form save / apply actions merge current workspace values with form values.
 *
 * @see {import('../../reducer/preferences/preferencesReducer.ts').WorkspaceWithSource}
 */

const displayValidation = z.object({
  general: displayGeneralValidation,
  panels: displayPanelsValidation,
});

export const workspaceValidation = z.object({
  nuclei: nucleiValidation,
  peaksLabel: peaksLabelValidation,
  general: generalValidation,
  display: displayValidation,
  nmrLoaders: nmrLoadersValidation,
  export: exportPreferencesValidation,
  databases: databasesValidation,
  infoBlock: infoBlockTabValidation,
  externalAPIs: externalAPIsValidation,
  onLoadProcessing: autoProcessingTabValidation,
  spectraColors: spectraColorsTabValidation,
});

// This object is used to define type not real values. Do not use it as values
export const defaultGeneralSettingsFormValues: z.input<
  typeof workspaceValidation
> = {
  spectraColors: spectraColorsTabValidation.encode(
    workspaceDefaultProperties.spectraColors,
  ),
  onLoadProcessing: autoProcessingTabValidation.encode(
    workspaceDefaultProperties.onLoadProcessing,
  ),
  databases: databasesValidation.encode(workspaceDefaultProperties.databases),
  nuclei: nucleiValidation.encode(workspaceDefaultProperties.nuclei),
  infoBlock: infoBlockTabValidation.encode(
    workspaceDefaultProperties.infoBlock,
  ),
  peaksLabel: {
    marginTop: 0,
  },
  general: {
    dimmedSpectraOpacity: 0,
    invert: false,
    invertScroll: false,
    spectraRendering: 'auto',
    loggingLevel: 'info',
    popupLoggingLevel: 'info',
  },
  display: {
    general: {
      experimentalFeatures: {
        display: false,
      },
    },
    panels: displayPanelsValidation.encode(
      workspaceDefaultProperties.display.panels,
    ),
  },
  nmrLoaders: nmrLoadersValidation.encode(
    workspaceDefaultProperties.nmrLoaders,
  ),
  export: exportPreferencesValidation.encode(workspaceDefaultProperties.export),
  externalAPIs: externalAPIsValidation.encode(
    workspaceDefaultProperties.externalAPIs,
  ),
};
