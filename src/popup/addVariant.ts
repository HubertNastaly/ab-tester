import { Variant } from "../types";
import { ExtendedHtmlElement } from "../utils/ExtendedHtmlElement";
import { store } from "../utils/store";

export class AddVariant extends ExtendedHtmlElement {
  private experimentIndex: number

  constructor(_experimentIndex: number) {
    super('add-variant-template');
    this.experimentIndex = _experimentIndex;
  }
  
  connectedCallback() {
    this.createFromTemplate()
    this.listenToInputChanges()
    this.listenOnSubmitVariant()
  }

  private listenToInputChanges() {
    const requiredInputs = Array.from(this.querySelectorAll('input'))
    requiredInputs.forEach(input => {
      input.addEventListener('input', () => {
        const addVariantButton = this.getHtmlElement('button')
        const shouldEnable = requiredInputs.every(input => !!input.value)
        if(shouldEnable) {
          addVariantButton.removeAttribute('disabled')
        } else {
          addVariantButton.setAttribute('disabled', 'true')
        }
      })
    })
  }

  private listenOnSubmitVariant() {
    this.getBySelector('form').addEventListener('submit', async (event) => {
      event.preventDefault()

      const variantId = this.getBySelector<HTMLInputElement>('label[name="variant-id"]>input').value
      const variantName = this.getBySelector<HTMLInputElement>('label[name="variant-name"]>input').value

      const newVariant: Variant = {
        id: variantId,
        name: variantName
      }

      store.pushVariants(this.experimentIndex, newVariant)

      this.remove()
    })
  }
}
