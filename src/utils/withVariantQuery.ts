const URL_VARIANT_REGEX = /optimizely_x=\d+&optimizely_token=PUBLIC/

export function withVariantQuery(url: string, variantId: string) {
  const sanitizedUrl = url.endsWith('/') ? url.slice(0, -1) : url
  const variantParams = getVariantUrlParams(variantId.trim())
  return sanitizedUrl.includes('optimizely_x')
    ? replaceVariant(sanitizedUrl, variantParams)
    : appendVariant(sanitizedUrl, variantParams)
}

export function clearVariantQuery(url: string) {
  const clearedUrl = replaceVariant(url, '')
  if(clearedUrl.endsWith('?') || clearedUrl.endsWith('&')) {
    return clearedUrl.slice(0, -1)
  } else {
    return clearedUrl
  }
}

function replaceVariant(url: string, variantUrlParams: string) {
  return url.replace(URL_VARIANT_REGEX, variantUrlParams)
}

function appendVariant(url: string, variantUrlParams: string) {
  const separator = url.includes('?') ? '&' : '?'
  return url + separator + variantUrlParams
}

function getVariantUrlParams(variantId: string) {
  return `optimizely_x=${variantId}&optimizely_token=PUBLIC`
}
