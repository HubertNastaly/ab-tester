import { Variant } from "../types"
import { getCurrentUrlVariantId, updateUrl } from "./url"
import { withVariantQuery } from "./withVariantQuery"

export async function attemptUrlVariantUpdate(selectedVariant: Variant) {
  const currentUrlVariantId = await getCurrentUrlVariantId()
  if(selectedVariant.id !== currentUrlVariantId) {
    updateUrl((currentUrl) => withVariantQuery(currentUrl, selectedVariant.id))
  }
}
