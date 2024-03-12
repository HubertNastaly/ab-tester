export function whenDocumentReady(callback: () => void, options?: AddEventListenerOptions) {
  if(document.readyState === 'complete') {
    callback()
  } else {
    window.addEventListener('load', callback, options)
  }
}
