import { Formatting } from '../../../workspaces/Workspace';

export function mapNucleiFormatting(formatting: Formatting): Formatting {
  const { nuclei, ...res } = formatting;
  const _nuclei = {};
  Object.keys(nuclei).forEach((key) => {
    _nuclei[nuclei[key].name.trim().toLowerCase()] = nuclei[key];
  });
  return { nuclei: _nuclei, ...res };
}
