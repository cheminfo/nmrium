import { SubMenu, MenuItem } from 'rc-menu';
import { createElement, cloneElement } from 'react';

function buildMenu(array: any[] = []) {
  const menu: any[] = [];
  for (const item of array) {
    if (item.children && Array.isArray(item.children)) {
      menu.push(getMenu(item.groupName, [item], []));
    } else {
      const { queryParams: query, ...itemProps } = item;
      menu.push(
        createElement(
          MenuItem,
          { key: itemProps.title, query, ...itemProps },
          itemProps.title,
        ),
      );
    }
  }
  return menu;
}

function getMenu(key, array: any[] = [], nodes: any[] = [], parentIndex = 0) {
  const _nodes = nodes;
  const children: any[] = [];

  if (parentIndex !== -1 && _nodes[parentIndex]) {
    _nodes[parentIndex] = cloneElement(_nodes[parentIndex], {}, children);
  }

  // eslint-disable-next-line @typescript-eslint/no-for-in-array
  for (const index in array) {
    if (array[index].children && Array.isArray(array[index].children)) {
      const node = createElement(SubMenu, {
        key: index + key,
        title: array[index].groupName,
      });
      _nodes.push(node);
      return getMenu(index + key, array[index].children, _nodes, 0);
    } else {
      const { queryParams: query, ...itemProps } = array[index];

      children.push(
        createElement(
          MenuItem,
          { key: index + key, query, ...itemProps },
          itemProps.title,
        ),
      );
    }
  }
  return _nodes;
}

function mapTreeToFlatArray(array: any[] = []) {
  let routes: any[] = [];
  for (const item of array) {
    if (item.children && Array.isArray(item.children)) {
      routes = routes.concat(getFlatArray([item], []));
    } else {
      routes.push(item);
    }
  }
  return routes;
}

function getFlatArray(inputArray: any[] = [], children: any[] = []) {
  const _children = children;

  for (const item of inputArray) {
    if (item.children && Array.isArray(item.children)) {
      return getFlatArray(item.children, _children);
    } else {
      children.push(item);
    }
  }
  return _children;
}

function getKey(filePath = '') {
  const match = new RegExp(/^(?<path>.*)\/(?<file>[^/]*)$/g).exec(filePath);
  let parentFolderName = '';
  if (match) {
    const parentPath = match[1].split('/');
    parentFolderName =
      parentPath.length > 2
        ? (parentPath.at(-2) as string) + (parentPath.at(-1) as string)
        : (parentPath.at(-1) as string);
  }
  return parentFolderName + filePath.replaceAll(/[\s./]/g, '');
}

export { buildMenu, getKey, mapTreeToFlatArray };
