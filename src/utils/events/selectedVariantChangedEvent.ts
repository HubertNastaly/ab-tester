import { Variant } from "../../types"

export const SELECTED_VARIANT_CHANGED_EVENT_NAME = 'selectedVariantChanged'

export interface SelectedVariantChangedPayload {
  experimentName: string
  variant: Variant
}

export type SelectedVariantChangedEvent = CustomEvent<SelectedVariantChangedPayload>
export const selectedVariantChanged = (experimentName: string, variant: Variant) => 
  new CustomEvent<SelectedVariantChangedPayload>(SELECTED_VARIANT_CHANGED_EVENT_NAME, { detail: { experimentName, variant }})
