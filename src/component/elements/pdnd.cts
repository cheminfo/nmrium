// https://github.com/atlassian/pragmatic-drag-and-drop/issues/27
// Given how `@atlaskit/pragmatic-drag-and-drop` publishes ESM in a non-native way,
// we have to trick TS into using the CJS build so that our build is compatible
// with native ESM.
// We cannot use `verbatimModuleSyntax` ts config option with this pattern.
export {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
export {
  attachClosestEdge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
export { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
export { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
export { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
export { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
