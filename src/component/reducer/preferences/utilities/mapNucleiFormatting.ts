import { Formatting } from '../../../workspaces/Workspace';

export function mapNucleiFormatting(formatting: Formatting) {
  const { nuclei, ...res } = formatting;
  const _nuclei: Formatting['nuclei'] = {};
  Object.keys(nuclei).forEach((key) => {
    _nuclei[nuclei[key].name.trim().toLowerCase()] = nuclei[key];
  });
  return { nuclei: _nuclei, ...res };
}
