/** @jsxImportSource @emotion/react */
import { SvgLogoNmrium } from 'cheminfo-font';
import { Modal, Toolbar, useOnOff } from 'react-science/ui';

import versionInfo from '../../versionInfo';
import Logo from '../elements/Logo';

import { ModalStyles } from './ModalStyle';

function AboutUsModal() {
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  return (
    <>
      <Toolbar.Item
        onClick={openDialog}
        titleOrientation="horizontal"
        id="logo"
        title="About NMRium"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SvgLogoNmrium />
        </div>
      </Toolbar.Item>
      <Modal
        hasCloseButton
        isOpen={isOpenDialog}
        onRequestClose={closeDialog}
        maxWidth={1000}
      >
        <div css={ModalStyles}>
          <Modal.Header>
            <div className="header">
              <span className="header-title">About NMRium</span>
            </div>
          </Modal.Header>
          <div className="container">
            <div className="center-container">
              <Logo width={160} height={50} />
              Version <VersionInfo />
              <span className="separator" />
              <a href="https://git.nmrium.org" target="_blank" rel="noreferrer">
                GitHub ( https://git.nmrium.org )
              </a>
            </div>
            <div className="center-container">
              <span className="separator" />
            </div>
            <span className="content">
              This project is developed by Zakodium Sàrl (Switzerland), the
              University of Cologne (Germany), Johannes Gutenberg University
              Mainz (Germany) and Universidad del Valle (Colombia).
            </span>
            <div className="center-container">
              <span className="separator" />
              <span className="title">Funding is provided by</span>
              <span className="separator" />
            </div>
            <div className="content">
              <ul>
                <li>
                  IDNMR grant, which part of the Scientific Library Services and
                  Information Systems (LIS) initiative of the DFG.
                </li>
                <li>Zakodium Sàrl (Switzerland).</li>
                <li>Universidad del Valle (Cali, Colombia).</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default AboutUsModal;

function VersionInfo() {
  const { version } = versionInfo;
  if (version === 'HEAD') {
    return <>HEAD</>;
  } else if (version.startsWith('git-')) {
    return (
      <a
        href={`https://github.com/cheminfo/nmrium/tree/${version.slice(4)}`}
        target="_blank"
        rel="noreferrer"
      >
        git-{version.slice(4, 14)}
      </a>
    );
  } else {
    return (
      <a
        href={`https://github.com/cheminfo/nmrium/tree/${version}`}
        target="_blank"
        rel="noreferrer"
      >
        {version}
      </a>
    );
  }
}
