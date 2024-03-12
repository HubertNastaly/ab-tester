export interface Variant {
  id: string
  name: string
}

export interface Experiment {
  name: string
  variants: Variant[]
  activeVariantId?: string
}

export interface ActiveVariant {
  experimentIndex: number
  variantId: string
}
