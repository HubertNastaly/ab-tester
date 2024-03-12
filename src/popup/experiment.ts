import { Experiment, Variant } from "../types";
import { ExtendedHtmlElement } from "../utils/ExtendedHtmlElement";
import { createSelectOption } from "../utils/createElement";
import { EventName } from "../utils/events";
import { observer } from "../utils/observer";
import { PORT_IDS } from "../utils/portIds";
import { store } from "../utils/store";
import { AddVariant } from "./addVariant";
import { RemoveExperiment } from "./removeExperiment";

export class ExperimentElement extends ExtendedHtmlElement {
  private readonly experiment: Experiment
  private isActive?: boolean

  constructor(_experiment: Experiment) {
    super('experiment-template')
    this.experiment = _experiment;
  }

  connectedCallback() {
    this.createFromTemplate()

    if(this.experiment.variants.length > 0) {
      this.enableActivateButton()
    }

    this.setAttribute('experiment-name', this.experiment.name)
    
    this.fillExperimentKey()
    this.addVariantOptions()
    this.listenOnPlusButtonClick()
    this.listenOnRemoveExperimentButtonClick()
    this.listenOnNewVariants()
    this.listenOnActivateClick()
    this.listenOnActivateChange()
  }

  private fillExperimentKey() {
    const experimentKey = this.getBySelector<HTMLButtonElement>('.experiment-key')
    experimentKey.innerHTML = this.experiment.name;
  }

  private addVariantOptions() {
    const variantSelect = this.getVariantSelect()

    variantSelect.addEventListener('change', () => {
      const newSelectedVariant = this.experiment.variants.find(({ id }) => id === variantSelect.value)
      store.selectVariant(this.experiment.name, newSelectedVariant!)
    })

    this.experiment.variants.forEach(variant => {
      const option = this.createVariantOption(variant)
      variantSelect.appendChild(option)
    })
  }

  private listenOnNewVariants() {
    observer.port(PORT_IDS.experiment(this.experiment.name)).observe(EventName.VariantAdded, ({ variant }) => {
      const option = this.createVariantOption(variant)
      this.getVariantSelect().appendChild(option)
  
      if(!this.experiment.selectedVariant) {
        store.selectVariant(this.experiment.name, variant)
      }
  
      if(this.experiment.variants.length === 1) {
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
      store.setActiveExperiment(this.isActive ? undefined : this.experiment.name)
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
        column.appendChild(new AddVariant(this.experiment.name))
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
        column.appendChild(new RemoveExperiment(this.experiment.name))
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
