export class ExtendedHtmlElement extends HTMLElement {
  private readonly templateId: string

  constructor(_templateId: string) {
    super()
    this.templateId = _templateId
  }

  protected createFromTemplate() {
    const template = document.getElementById(this.templateId) as HTMLTemplateElement | null
    if(!template) {
      throw new Error(`Cannot find template with id: ${this.templateId}`)
    }
    const content = template.content.cloneNode(true)
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
