import {
  FaCopy,
  FaDownload,
  FaFile,
  FaFileDownload,
  FaFileImage,
} from 'react-icons/fa';

import { ToolbarPopoverMenuItem } from '../elements/ToolbarPopoverItem';

const IMPORT_MENU: ToolbarPopoverMenuItem[] = [
  {
    icon: <FaFile />,
    text: 'Import from file system (press Ctrl+o)',
    data: {
      id: 'importFile',
    },
  },
  {
    icon: <FaFile />,
    text: 'Add JCAMP-DX from URL',
    data: {
      id: 'importJDX',
    },
  },
  {
    icon: <FaFile />,
    text: 'Generate spectrum from publication string',
    data: {
      id: 'importPublicationString',
    },
  },
  {
    icon: <FaFile />,
    text: 'Import meta information',
    data: {
      id: 'importMetaInformation',
    },
  },
] as const;

const EXPORT_MENU: ToolbarPopoverMenuItem[] = [
  {
    icon: <FaDownload />,
    text: 'Export as SVG',
    data: {
      id: 'svg',
    },
  },
  {
    icon: <FaFileImage />,
    text: 'Export as PNG',
    data: {
      id: 'png',
    },
  },
  {
    icon: <FaFileDownload />,
    text: 'Save data (press Ctrl+s)',
    data: {
      id: 'json',
    },
  },
  {
    icon: <FaFileDownload />,
    text: 'Save data as (press Ctrl+Shift+s)',
    data: {
      id: 'advance_save',
    },
  },
  {
    icon: <FaFileDownload />,
    text: 'Save NMRE data',
    data: {
      id: 'nmre',
    },
  },
  {
    icon: <FaCopy />,
    text: 'Copy image to clipboard (press Ctrl+c)',
    data: {
      id: 'copy',
    },
  },
] as const;

export { EXPORT_MENU, IMPORT_MENU };
