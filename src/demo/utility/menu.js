import React from 'react';
import { SubMenu, MenuItem } from 'rc-menu';

function buildMenu(array = []) {
  let menu = [];
  for (const item of array) {
    const key = Math.random()
      .toString(36)
      .replace('0.', '');

    if (item.hasChild && item.child && item.hasChild === true) {
      menu.push(getMenu([item], [], key));
    } else {
      menu.push(
        React.createElement(MenuItem, { key: item.title, ...item }, item.title),
      );
    }
  }
  return menu;
}

function getMenu(array = [], nodes = [], key, parentIndex = -1) {
  let _nodes = nodes;
  let children = [];

  if (parentIndex !== -1 && _nodes[parentIndex]) {
    _nodes[parentIndex] = React.cloneElement(_nodes[parentIndex], {}, children);
  }

  for (const index in array) {
    if (
      array[index].hasChild &&
      array[index].child &&
      array[index].hasChild === true
    ) {
      const node = React.createElement(SubMenu, {
        key: index + key,
        title: array[index].groupName,
      });
      _nodes.push(node);
      parentIndex++;
      return getMenu(array[index].child, _nodes, key, parentIndex);
    } else {
      children.push(
        React.createElement(
          MenuItem,
          { key: index + key, ...array[index] },
          array[index].title,
        ),
      );
    }
  }
  return _nodes;
}

function mapTreeToFlatArray(array = []) {
  let routes = [];
  for (const item of array) {
    if (item.hasChild && item.child && item.hasChild === true) {
      routes = routes.concat(getFlatArray([item], []));
    } else {
      routes.push(item);
    }
  }
  return routes;
}

function getFlatArray(inputArray = [], children = []) {
  let _children = children;

  for (const item of inputArray) {
    if (item.hasChild && item.child && item.hasChild === true) {
      return getFlatArray(item.child, _children);
    } else {
      children.push(item);
    }
  }
  return _children;
}

function getKey(filePath = '') {
  return filePath.replace(/\.|\s|\//g, '');
}

export { buildMenu, getKey, mapTreeToFlatArray };
