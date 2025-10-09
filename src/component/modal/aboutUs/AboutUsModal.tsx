import { Dialog } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { SvgLogoNmrium } from 'cheminfo-font';
import { Toolbar, useOnOff } from 'react-science/ui';

import versionInfo from '../../../versionInfo.js';
import { useCore } from '../../context/CoreContext.js';
import Logo from '../../elements/Logo.js';
import { StyledDialogBody } from '../../elements/StyledDialogBody.js';
import { renderCoreSlot } from '../../utility/renderCoreSlot.js';

import AboutUsZakodium from './AboutUsZakodium.js';

const FallbackDialogContents = styled.div`
  display: flex;
  flex-direction: column;
  user-select: none;

  padding: 20px;

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
    color: #ea580c;
    font-weight: bold;
  }

  span.content {
    color: #2b143e;
    font-size: 14px;
    text-align: left;
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
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const Separator = styled.span`
  border-bottom: 1px solid gray;
  height: 1px;
  margin: 10px 0;
  width: 15px;
`;

const modalContentFallback = (
  <FallbackDialogContents>
    <InfoBlock>
      <Logo width={160} height={50} />
      Version <VersionInfo />
      <Separator />
      <a
        href="https://github.com/cheminfo/nmrium"
        target="_blank"
        rel="noreferrer"
      >
        GitHub ( https://github.com/cheminfo/nmrium )
      </a>
    </InfoBlock>
    <InfoBlock>
      <Separator />
    </InfoBlock>
    <span className="content">
      This project is developed by Zakodium Sàrl (Switzerland), the University
      of Cologne (Germany), Johannes Gutenberg University Mainz (Germany) and
      Universidad del Valle (Colombia).
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
          This project has received funding from the European Union’s Horizon
          2020 research and innovation programme under grant agreement No
          957189. The project is part of BATTERY 2030+, the large-scale European
          research initiative for inventing the sustainable batteries of the
          future.
        </li>
      </ul>
    </div>
  </FallbackDialogContents>
);

function AboutUsModal() {
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  const core = useCore();

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
        <StyledDialogBody>
          {renderCoreSlot(core, 'topbar.about_us.modal', modalContentFallback)}
        </StyledDialogBody>
      </Dialog>
    </>
  );
}

export default AboutUsModal;

function VersionInfo() {
  const { version } = versionInfo;
  if (version === 'HEAD') {
    return 'HEAD';
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
