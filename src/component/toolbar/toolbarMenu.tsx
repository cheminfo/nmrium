import {
  FaCopy,
  FaDownload,
  FaFile,
  FaFileDownload,
  FaFileImage,
} from 'react-icons/fa';

import { DropdownMenuItem } from '../elements/DropdownMenu';

const IMPORT_MENU: DropdownMenuItem[] = [
  {
    icon: <FaFile />,
    text: 'Import from file system (Press Ctrl + O)',
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

const EXPORT_MENU: DropdownMenuItem[] = [
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
    text: 'Save data ( Press Ctrl + S )',
    data: {
      id: 'json',
    },
  },
  {
    icon: <FaFileDownload />,
    text: 'Save data as  ( Press Ctrl + Shift + S )',
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
    text: 'Copy image to Clipboard ( Press Ctrl + C )',
    data: {
      id: 'copy',
    },
  },
] as const;

export { EXPORT_MENU, IMPORT_MENU };
