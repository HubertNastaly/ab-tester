export interface Variant {
  id: string
  name: string
}

export interface Experiment {
  name: string
  variants: Variant[]
  selectedVariant?: Variant
}
