import type { IconName } from '@blueprintjs/icons';
import { IconNames } from '@blueprintjs/icons';
import styled from '@emotion/styled';
import init from '@zakodium/nmrium-core-plugins';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Toolbar } from 'react-science/ui';

import { NMRium } from '../../component/main/index.js';

import type { ViewProps } from './View.helpers.js';
import { useView } from './View.helpers.js';

const Container = styled.section`
  display: flex;
  flex-direction: column;
  height: 100%;

  & > h1 {
    font-weight: 700;
    font-size: 1.5em;
    line-height: 1.4em;
    padding: 0.75em;
  }
`;

const NMRiumContainer = styled.div`
  flex: 1;
`;

const DemoContext = createContext<{
  setRandom: () => void;
  icon: IconName;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
}>({ icon: 'console', setRandom: () => {} });

function DemoTopBarRight() {
  const { setRandom, icon } = useContext(DemoContext);

  return (
    <Toolbar>
      <Toolbar.Item
        id="demo-topbar-right"
        icon={icon}
        tooltip="Demo topbar right"
        onClick={setRandom}
      />
    </Toolbar>
  );
}

const core = init([
  {
    id: 'demo-plugin-topbar',
    version: 1,
    migrations: [],
    ui: {
      'topbar.right': DemoTopBarRight,
    },
  },
]);

const possibleIcons = Object.values(IconNames);
export default function PluginUITopBar(props: ViewProps) {
  const [data, otherProps] = useView(props);

  const { workspace, customWorkspaces } = otherProps;

  const [icon, setIcon] = useState<IconName>('console');
  const setRandom = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * possibleIcons.length);
    setIcon(possibleIcons[randomIndex]);
  }, []);
  const context = useMemo(() => ({ setRandom, icon }), [icon, setRandom]);

  return (
    <Container>
      <h1>TopBar Plugin</h1>

      <NMRiumContainer>
        <DemoContext.Provider value={context}>
          <NMRium
            core={core}
            data={data}
            {...(workspace && { workspace })}
            {...(customWorkspaces && { customWorkspaces })}
          />
        </DemoContext.Provider>
      </NMRiumContainer>
    </Container>
  );
}
