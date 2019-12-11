import React from 'react';

const Menu = ({ list }) => {
  function createMenu(array = [], nodes = [], parentIndex = -1) {
    let _nodes = nodes;
    let children = [];

    if (parentIndex !== -1 && _nodes[parentIndex]) {
      _nodes[parentIndex] = React.cloneElement(
        _nodes[parentIndex],
        {},
        children,
      );
    }

    for (const index in array) {
      if (
        array[index].hasChild &&
        array[index].child &&
        array[index].hasChild === true
      ) {
        _nodes.push(
          React.createElement('p', { key: index }, array[index].groupName),
        );
        _nodes.push(
          React.createElement('div', { key: index }, array[index].groupName),
        );
        parentIndex += 2;
        return createMenu(array[index].child, _nodes, parentIndex);
      } else {
        children.push(
          React.createElement('span', { key: index }, array[index].title),
        );
      }
    }

    return _nodes;
  }

  return <div>{list && createMenu(list, [])}</div>;
};

export default Menu;
