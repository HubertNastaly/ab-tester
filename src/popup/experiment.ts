import { Variant } from "../types";
import { ExtendedHtmlElement } from "../utils/ExtendedHtmlElement";
import { createSelectOption } from "../utils/createElement";
import { EventName } from "../utils/events";
import { observer } from "../utils/observer";
import { PORT_IDS } from "../utils/portIds";
import { store } from "../utils/store";
import { AddVariant } from "./addVariant";
import { RemoveExperiment } from "./removeExperiment";

export class ExperimentElement extends ExtendedHtmlElement {
  private index: number
  private name: string
  private variants: Variant[]
  private activeVariantId?: string;
  private isActive?: boolean

  constructor(_index: number, _name: string, _variants: Variant[] = []) {
    super('experiment-template')
    this.index = _index;
    this.name = _name;
    this.variants = _variants;
  }

  connectedCallback() {
    this.createFromTemplate()

    if(this.variants.length > 0) {
      this.activeVariantId = this.variants[this.variants.length - 1].id
      this.enableActivateButton()
    }

    this.setAttribute('experiment-name', this.name)
    
    this.fillExperimentKey(this.name)
    this.addVariantOptions(this.variants)
    this.listenOnPlusButtonClick()
    this.listenOnRemoveExperimentButtonClick()
    this.listenOnNewVariants()
    this.listenOnActivateClick()
    this.listenOnActivateChange()
  }

  private fillExperimentKey(name: string) {
    const experimentKey = this.getBySelector<HTMLButtonElement>('.experiment-key')
    experimentKey.innerHTML = name;
  }

  private addVariantOptions(variants: Variant[]) {
    const variantSelect = this.getVariantSelect()

    variantSelect.addEventListener('change', () => {
      this.activeVariantId = variantSelect.value
    })

    variants.forEach(variant => {
      const option = this.createVariantOption(variant)
      variantSelect.appendChild(option)
    })
  }

  private listenOnNewVariants() {
    observer.port(PORT_IDS.experiment(this.index)).observe(EventName.VariantAdded, ({ variant }) => {
      const option = this.createVariantOption(variant)
      this.getVariantSelect().appendChild(option)
  
      if(!this.activeVariantId) {
        this.activeVariantId = variant.id
      }
  
      if(this.variants.length === 1) {
        this.enableActivateButton()
      }
    })
  }

  private listenOnActivateChange() {
    const mutationObserver = new MutationObserver((mutations) => {
      for(const mutation of mutations) {
        if(mutation.type === 'attributes' && mutation.attributeName === 'active') {
          this.isActive = this.getAttribute('active') === 'true'
          this.getActivateButton().innerHTML = this.isActive ? 'Active' : 'Activate'
        }
      }
    })

    mutationObserver.observe(this, { attributes: true })
  }

  private listenOnActivateClick() {
    this.getActivateButton().addEventListener('click', async () => {
      store.setActiveExperimentIndex(this.isActive ? undefined : this.index)
    })
  }

  private listenOnPlusButtonClick() {
    const plusButton = this.getBySelector<HTMLButtonElement>('.addVariant')
    plusButton.addEventListener('click', async () => {
      const column = this.getBySelector('.column')
      const addVariantForm = this.querySelector('add-variant')
      if(addVariantForm) {
        column.removeChild(addVariantForm)
      } else {
        column.appendChild(new AddVariant(this.index))
      }
    })
  }

  private listenOnRemoveExperimentButtonClick() {
    const removeButton = this.getBySelector<HTMLButtonElement>('.removeExperiment')
    removeButton.addEventListener('click', async () => {
      const column = this.getBySelector('.column')
      const removeExperimentForm = this.querySelector('remove-experiment')
      if(removeExperimentForm) {
        column.removeChild(removeExperimentForm)
      } else {
        column.appendChild(new RemoveExperiment(this.index))
      }
    })
  }

  private enableActivateButton() {
    this.getActivateButton().removeAttribute('disabled')
  }

  private createVariantOption({ id, name }: Variant): HTMLOptionElement {
    return createSelectOption(id, `${name} (${id})`)
  }

  private getActivateButton() {
    return this.getBySelector<HTMLButtonElement>('.activate')
  }

  private getVariantSelect() {
    return this.getBySelector<HTMLSelectElement>('.experimentVariant')
  }
}
