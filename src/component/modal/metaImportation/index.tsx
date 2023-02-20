import { useCallback } from 'react';

import { useModal } from '../../elements/popup/Modal/Context';
import { positions } from '../../elements/popup/options';

import MetaImportationModal from './MetaImportationModal';

export { default as MetaImportationModal } from './MetaImportationModal';

export function useMetaInformationImportationModal() {
  const modal = useModal();

  return useCallback(
    (file?: File) => {
      modal.show(
        <MetaImportationModal file={file} onClose={() => modal.close()} />,
        {
          position: positions.MIDDLE,
          enableResizing: true,
          width: 900,
          height: 600,
        },
      );
    },
    [modal],
  );
}
