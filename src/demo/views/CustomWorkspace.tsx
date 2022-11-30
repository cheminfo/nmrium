import { CustomWorkspaces } from '../../component/workspaces/Workspace';

import View from './View';

const customWorkspaces: CustomWorkspaces = {
  default: {
    label: 'Test Workspace',
    display: {
      panels: {
        spectraPanel: { display: true, open: true },
        multipleSpectraAnalysisPanel: { display: true, open: true },
      },
    },
  },
};

export default function CustomWorkspace(props) {
  return <View {...props} customWorkspaces={customWorkspaces} />;
}
