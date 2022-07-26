import { Formatting } from '../../../workspaces/Workspace';

export function mapNucleiFormatting(formatting: Formatting) {
  const { nuclei, ...res } = formatting;
  const _nuclei = Object.keys(nuclei).reduce((nucleusFormatting, key) => {
    nucleusFormatting[nuclei[key].name.trim().toLowerCase()] = nuclei[key];
    return nucleusFormatting;
  }, {});
  return { nuclei: _nuclei, ...res };
}
