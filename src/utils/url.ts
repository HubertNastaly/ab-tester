import { Variant } from '../types'

export async function getCurrentTab() {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  })
  return currentTab
}

export async function updateUrl(modifyUrl: (currentUrl: string) => string) {
  const { id, url } = await getCurrentTab()
  if (id && url) {
    chrome.tabs.update(id, { url: modifyUrl(url) })
  }
}

export async function getCurrentUrlVariantId() {
  const { url } = await getCurrentTab()
  const urlVariantId = url
    ?.match(/optimizely_x=[^&]+/)?.[0]
    .replace('optimizely_x=', '')
  return urlVariantId
}

export async function attemptUrlVariantUpdate(selectedVariant: Variant) {
  const currentUrlVariantId = await getCurrentUrlVariantId()
  if (selectedVariant.id !== currentUrlVariantId) {
    updateUrl((currentUrl) => withVariantQuery(currentUrl, selectedVariant.id))
  }
}

export function withVariantQuery(url: string, variantId: string) {
  const sanitizedUrl = url.endsWith('/') ? url.slice(0, -1) : url
  const variantParams = getVariantUrlParams(variantId.trim())
  return sanitizedUrl.includes('optimizely_x')
    ? replaceVariant(sanitizedUrl, variantParams)
    : appendVariant(sanitizedUrl, variantParams)
}

export function clearVariantQuery(url: string) {
  const clearedUrl = replaceVariant(url, '')
  if (clearedUrl.endsWith('?') || clearedUrl.endsWith('&')) {
    return clearedUrl.slice(0, -1)
  } else {
    return clearedUrl
  }
}

function replaceVariant(url: string, variantUrlParams: string) {
  const urlVariantRegex = /optimizely_x=\d+&optimizely_token=PUBLIC/
  return url.replace(urlVariantRegex, variantUrlParams)
}

function appendVariant(url: string, variantUrlParams: string) {
  const separator = url.includes('?') ? '&' : '?'
  return url + separator + variantUrlParams
}

function getVariantUrlParams(variantId: string) {
  return `optimizely_x=${variantId}&optimizely_token=PUBLIC`
}
