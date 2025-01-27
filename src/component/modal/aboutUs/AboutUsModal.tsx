import { Dialog } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { SvgLogoNmrium } from 'cheminfo-font';
import { Toolbar, useOnOff } from 'react-science/ui';

import versionInfo from '../../../versionInfo.js';
import Logo from '../../elements/Logo.js';
import { StyledDialogBody } from '../../elements/StyledDialogBody.js';

import AboutUsZakodium from './AboutUsZakodium.js';

const CustomDialogBody = styled(StyledDialogBody)`
  display: flex;
  flex-direction: column;
  user-select: none;

  button:focus {
    outline: none;
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
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Container = styled.div`
  padding: 20px;
`;

const Separator = styled.span`
  border-bottom: 1px solid gray;
  width: 15px;
  height: 1px;
  margin: 10px 0;
`;

function AboutUsModal() {
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  return (
    <>
      <Toolbar.Item
        onClick={openDialog}
        id="logo"
        tooltip="About NMRium"
        icon={<SvgLogoNmrium />}
      />
      <Dialog
        isOpen={isOpenDialog}
        onClose={closeDialog}
        style={{
          maxWidth: 1000,
          width: '40vw',
          minWidth: '500px',
        }}
        title="About NMRium"
      >
        <CustomDialogBody>
          <Container>
            <InfoBlock>
              <Logo width={160} height={50} />
              Version <VersionInfo />
              <Separator />
              <a href="https://git.nmrium.org" target="_blank" rel="noreferrer">
                GitHub ( https://git.nmrium.org )
              </a>
            </InfoBlock>
            <InfoBlock>
              <Separator />
            </InfoBlock>
            <span className="content">
              This project is developed by Zakodium Sàrl (Switzerland), the
              University of Cologne (Germany), Johannes Gutenberg University
              Mainz (Germany) and Universidad del Valle (Colombia).
            </span>
            <InfoBlock>
              <Separator />
              <span className="title">Funding is provided by</span>
              <Separator />
            </InfoBlock>
            <div className="content">
              <ul>
                <li>
                  IDNMR grant, which part of the Scientific Library Services and
                  Information Systems (LIS) initiative of the DFG.
                </li>
                <li>
                  <AboutUsZakodium />
                </li>
                <li>Universidad del Valle (Cali, Colombia).</li>
                <li>
                  This project has received funding from the European Union’s
                  Horizon 2020 research and innovation programme under grant
                  agreement No 957189. The project is part of BATTERY 2030+, the
                  large-scale European research initiative for inventing the
                  sustainable batteries of the future.
                </li>
              </ul>
            </div>
            <Separator />
          </Container>
        </CustomDialogBody>
      </Dialog>
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
