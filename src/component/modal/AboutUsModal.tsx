/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgLogoNmrium } from 'cheminfo-font';
import { Modal, Toolbar, useOnOff } from 'react-science/ui';

import versionInfo from '../../versionInfo';
import Logo from '../elements/Logo';

const styles = css`
  display: flex;
  flex-direction: column;
  user-select: none;
  button:focus {
    outline: none;
  }
  .header {
    font-size: 15px;
    color: #464646;
    user-select: none;
  }
  .container {
    padding: 20px;
  }

  .center-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  ul {
    list-style-type: disc;
    margin-left: 20px;
  }
  span,
  li {
    user-select: text;
  }
  span.title {
    font-weight: bold;
    color: #ea580c;
  }
  span.content {
    color: #2b143e;
    font-size: 14px;
    text-align: left;
  }

  img {
    width: 100px;
  }

  a {
    color: #969696;
  }

  a:hover,
  a:focus {
    color: #00bcd4;
  }

  .separator {
    border-bottom: 1px solid gray;
    width: 15px;
    height: 1px;
    margin: 10px 0px;
  }
  width: 500px;
`;

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
      <Modal hasCloseButton isOpen={isOpenDialog} onRequestClose={closeDialog}>
        <div css={styles}>
          <Modal.Header>
            <div className="header">
              <span>About NMRium</span>
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
