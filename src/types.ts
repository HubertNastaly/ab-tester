export interface Variant {
  id: string
  name: string
}

export interface Experiment {
  name: string
  variants: Variant[]
  selectedVariant?: Variant
}

export type RecuirsiveReadonly<T> = {
  readonly [P in keyof T]:
    T[P] extends [] ?
      ReadonlyArray<RecuirsiveReadonly<T[P][number]>> :
    T[P] extends {} ?
      RecuirsiveReadonly<T[P]> :
    Readonly<T[P]>
}
