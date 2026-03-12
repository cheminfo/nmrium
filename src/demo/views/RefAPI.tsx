import { FileCollection } from 'file-collection';
import { useCallback, useRef } from 'react';
import { Button, DropZone } from 'react-science/ui';

import type { NMRiumRefAPI } from '../../component/main/index.js';
import { NMRium } from '../../component/main/index.js';
import { saveAs } from '../../component/utility/save_as.ts';

export default function RefAPI() {
  const nmriumRef = useRef<NMRiumRefAPI>(null);
  const dropLoadFileCollectionHandler = useCallback((dropFiles: File[]) => {
    const fileCollection = new FileCollection();
    void fileCollection.appendFileList(dropFiles).then(() => {
      nmriumRef.current?.loadFileCollection(fileCollection);
    });
  }, []);
  const dropLoadFilesHandler = useCallback((dropFiles: File[]) => {
    nmriumRef.current?.loadFiles(dropFiles);
  }, []);

  async function saveAsNMRiumFile() {
    const blob = await nmriumRef.current?.getNMRiumFile({
      settings: true,
      view: true,
      dataType: 'SELF_CONTAINED',
    });

    if (!blob) return;

    saveAs({ blob, name: 'experiment', extension: '.nmrium.zip' });
  }

  return (
    <div
      style={{
        height: '100%',
        marginLeft: 30,
      }}
    >
      <Button onClick={saveAsNMRiumFile}>Save as NMRium File</Button>
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          padding: '20px 0',
        }}
      >
        <div style={{ flex: 9 }}>
          <NMRium ref={nmriumRef} />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '10px',
            flex: 3,
          }}
        >
          <div style={{ flex: 3, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              <DropZone
                onDrop={dropLoadFileCollectionHandler}
                emptyTitle="Drop data files"
                emptyDescription="To load with ref.loadFileCollection API"
              />
            </div>
            <div style={{ flex: 1 }}>
              <DropZone
                onDrop={dropLoadFilesHandler}
                emptyTitle="Drop data files"
                emptyDescription="To load with ref.loadFiles API"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
