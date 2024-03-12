import { cloneTemplateContent } from "./cloneTemplateContent"

export class ExtendedHtmlElement extends HTMLElement {
  private readonly templateName: string

  constructor(_templateName: string) {
    super()
    this.templateName = _templateName
  }

  protected createFromTemplate() {
    const content = cloneTemplateContent(this.templateName)
    this.appendChild(content)
  }

  protected getHtmlElement<T extends keyof HTMLElementTagNameMap>(tagName: T) {
    const element = this.querySelector(tagName)
    if(!element) {
      throw new Error(`Cannot find element matching tag: ${tagName}`)
    }
  
    return element
  }

  protected getBySelector<T extends HTMLElement>(selector: string) {
    const element = this.querySelector(selector)
    if(!element) {
      throw new Error(`Cannot find element matching selector: ${selector}`)
    }

    return element as T
  }
}
