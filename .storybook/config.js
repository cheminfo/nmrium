import { addParameters, configure } from '@storybook/react';

addParameters({
  options: {
    panelPosition: 'right'
  }
})

function loadStories() {
  require('../src/stories');
}

configure(loadStories, module);
