export type FilterType<SourceType, Type> = Pick<
  SourceType,
  {
    [K in keyof SourceType]: SourceType[K] extends Type ? K : never;
  }[keyof SourceType]
>;
