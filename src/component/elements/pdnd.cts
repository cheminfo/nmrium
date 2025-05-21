// https://github.com/atlassian/pragmatic-drag-and-drop/issues/27
// Given how `@atlaskit/pragmatic-drag-and-drop` publishes ESM in a non-native way,
// we have to trick TS into using the CJS build so that our build is compatible
// with native ESM.
// We cannot use `verbatimModuleSyntax` ts config option with this pattern.
export {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
