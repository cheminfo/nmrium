interface PanelOptions {
  display: boolean;
  open?: boolean;
  hidden?: false;
}
interface HiddenPanelOptions {
  hidden: true;
}

export type PanelPreferencesType = PanelOptions | HiddenPanelOptions;
