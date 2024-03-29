import { Experiment, Variant } from '../types'
import { ExtendedHtmlElement } from '../utils/ExtendedHtmlElement'
import { createSelectOption } from '../utils/createElement'
import { EventName } from '../utils/events'
import { PORTS, observer } from '../utils/observer'
import { store } from '../utils/store'
import { attemptUrlVariantUpdate } from '../utils/url'
import { AddVariant } from './addVariant'
import { RemoveExperiment } from './removeExperiment'

export class ExperimentElement extends ExtendedHtmlElement {
  public static readonly htmlTag = 'custom-experiment'
  private readonly experiment: Experiment
  private isActive?: boolean

  constructor(_experiment: Experiment) {
    super('experiment-template')
    this.experiment = _experiment
  }

  connectedCallback() {
    this.createFromTemplate()

    if (this.experiment.variants.length > 0) {
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
    const experimentKey =
      this.getBySelector<HTMLButtonElement>('.experiment-key')
    experimentKey.innerHTML = this.experiment.name
  }

  private addVariantOptions() {
    const variantSelect = this.getVariantSelect()

    variantSelect.addEventListener('change', () => {
      const newSelectedVariant = this.experiment.variants.find(
        ({ id }) => id === variantSelect.value
      )
      if (!newSelectedVariant) {
        throw new Error(`Missing selected variant: ${variantSelect.value}`)
      }

      store.selectVariant(this.experiment.name, newSelectedVariant)

      if (this.isActive) {
        attemptUrlVariantUpdate(newSelectedVariant)
      }
    })

    this.experiment.variants.forEach((variant) => {
      const option = this.createVariantOption(variant)
      variantSelect.appendChild(option)
    })

    if (this.experiment.selectedVariant) {
      variantSelect.value = this.experiment.selectedVariant?.id
    }
  }

  private listenOnNewVariants() {
    observer
      .port(PORTS.experiment(this.experiment.name))
      .observe(EventName.VariantAdded, ({ variant }) => {
        const option = this.createVariantOption(variant)
        this.getVariantSelect().appendChild(option)

        if (!this.experiment.selectedVariant) {
          store.selectVariant(this.experiment.name, variant)
        }

        if (this.experiment.variants.length === 1) {
          this.enableActivateButton()
        }
      })
  }

  private listenOnActivateChange() {
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'active'
        ) {
          this.isActive = this.getAttribute('active') === 'true'
          this.getActivateButton().innerHTML = this.isActive
            ? 'Active'
            : 'Activate'
        }
      }
    })

    mutationObserver.observe(this, { attributes: true })
  }

  private listenOnActivateClick() {
    this.getActivateButton().addEventListener('click', async () => {
      store.setActiveExperiment(
        this.isActive ? undefined : this.experiment.name
      )
    })
  }

  private listenOnPlusButtonClick() {
    const plusButton = this.getBySelector<HTMLButtonElement>('.addVariant')
    plusButton.addEventListener('click', async () => {
      const column = this.getBySelector('.column')
      const addVariantForm = this.querySelector(AddVariant.htmlTag)
      if (addVariantForm) {
        column.removeChild(addVariantForm)
      } else {
        column.appendChild(new AddVariant(this.experiment))
      }
    })
  }

  private listenOnRemoveExperimentButtonClick() {
    const removeButton =
      this.getBySelector<HTMLButtonElement>('.removeExperiment')
    removeButton.addEventListener('click', async () => {
      const column = this.getBySelector('.column')
      const removeExperimentForm = this.querySelector(RemoveExperiment.htmlTag)
      if (removeExperimentForm) {
        column.removeChild(removeExperimentForm)
      } else {
        column.appendChild(new RemoveExperiment(this.experiment))
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
