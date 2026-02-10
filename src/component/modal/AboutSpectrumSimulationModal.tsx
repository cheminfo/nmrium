import styled from '@emotion/styled';
import { FaInfo } from 'react-icons/fa';
import { Toolbar, useOnOff } from 'react-science/ui';

import { StandardDialog } from '../elements/StandardDialog.tsx';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';

const DialogBody = styled(StyledDialogBody)`
  background-color: white;

  ul {
    list-style-type: disc;
    margin-left: 25px;
  }

  p,
  li {
    font-size: 1.1em;
    user-select: text;
  }

  a {
    color: #00bcd4;
  }

  a:hover,
  a:focus {
    text-decoration: underline;
  }

  .header span {
    color: #464646;
    flex: 1;
    font-size: 15px;
    user-select: none;
  }

  p {
    padding: 0.8em 0;
  }
`;

function AboutSpectrumSimulationModal() {
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  return (
    <>
      <Toolbar>
        <Toolbar.Item
          onClick={openDialog}
          tooltip="About prediction"
          icon={<FaInfo />}
        />
      </Toolbar>
      <StandardDialog
        isOpen={isOpenDialog}
        onClose={closeDialog}
        title="About spectrum simulation"
        style={{ width: '600px' }}
      >
        <DialogBody>
          <p>If you are using our tools please cite us:</p>
          <ul>
            <li>
              Andrés M. Castillo, Luc Patiny and Julien Wist{' '}
              <a
                href="http://dx.doi.org/10.1016/j.jmr.2010.12.008"
                target="_blank"
                rel="noreferrer"
              >
                Fast and Accurate Algorithm for the Simulation of NMR spectra of
                Large Spin Systems
              </a>{' '}
              <i>Journal of Magnetic Resonance</i> <b>2011</b>, 209(2), 123-130.
            </li>
          </ul>
        </DialogBody>
      </StandardDialog>
    </>
  );
}

export default AboutSpectrumSimulationModal;
