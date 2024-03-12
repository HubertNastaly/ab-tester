export async function getCurrentTab() {
  const [currentTab] = (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))
  return currentTab
}

export async function updateUrl(modifyUrl: (currentUrl: string) => string) {
  const { id, url } = await getCurrentTab()
  if(id && url) {
    chrome.tabs.update(id, { url: modifyUrl(url) })
  }
}

export async function getCurrentUrlVariantId() {
  const { url } = await getCurrentTab()
  const urlVariantId = url?.match(/optimizely_x=[^&]+/)?.[0].replace('optimizely_x=', '')
  return urlVariantId
}
