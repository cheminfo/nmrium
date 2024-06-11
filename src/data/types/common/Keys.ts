export type Keys<T> = T extends object
  ? T extends infer O
    ?
        | {
            [K in keyof O]-?: K extends string | number | symbol
              ? `${K & string}${Keys<O[K]> extends '' ? '' : '.'}${Keys<O[K]>}`
              : never;
          }[keyof O]
        | keyof O
    : never
  : '';
