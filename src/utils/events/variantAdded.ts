import { Variant } from '../../types'

export const VARIANT_ADDED_EVENT_NAME = 'variantAdded'

export interface VariantAddedPayload {
  variant: Variant
}

export type VariantAddedEvent = CustomEvent<VariantAddedPayload>
export const variantAdded = (variant: Variant) =>
  new CustomEvent<VariantAddedPayload>(VARIANT_ADDED_EVENT_NAME, {
    detail: { variant },
  })
