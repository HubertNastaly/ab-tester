import { ExtendedHtmlElement } from '../utils/ExtendedHtmlElement'
import { EventName } from '../utils/events'
import { observer } from '../utils/observer'
import {
  parseSavedExperiments,
  readSavedExperiments,
} from '../utils/savedExperiments'
import { store } from '../utils/store'
import {
  attemptUrlVariantUpdate,
  clearVariantQuery,
  updateUrl,
} from '../utils/url'
import { ExperimentElement } from './experiment'

export class Experiments extends ExtendedHtmlElement {
  public static readonly htmlTag = 'custom-experiments'

  constructor() {
    super('experiments-template')
    this.listenOnNewExperiments()
    this.listenOnExperimentRemoved()
    this.listenOnActiveExperimentChange()
    this.populateSavedExperiments()
  }

  private async populateSavedExperiments() {
    const savedExperiments = await readSavedExperiments()
    if (!savedExperiments) return

    const { experiments, activeExperiment } =
      parseSavedExperiments(savedExperiments)
    store.pushExperiments(experiments)
    if (activeExperiment) {
      store.setActiveExperiment(activeExperiment.name)
    }
  }

  private listenOnNewExperiments() {
    observer.observe(EventName.ExperimentsAdded, ({ experiments }) => {
      experiments.forEach((experiment) => {
        this.appendChild(new ExperimentElement(experiment))
      })
    })
  }

  private listenOnExperimentRemoved() {
    observer.observe(EventName.ExperimentRemoved, ({ experimentName }) => {
      const experiment = this._getExperimentElement(experimentName)
      this.removeChild(experiment)
    })
  }

  private listenOnActiveExperimentChange() {
    observer.observe(
      EventName.ActiveExperimentChanged,
      async ({ oldExperiment, newExperiment }) => {
        if (oldExperiment) {
          const oldExperimentElement = this._getExperimentElement(
            oldExperiment.name
          )
          oldExperimentElement.removeAttribute('active')
        }

        if (!newExperiment) {
          await updateUrl((currentUrl) => clearVariantQuery(currentUrl))
          return
        }

        const { selectedVariant } = newExperiment
        if (!selectedVariant) return

        const newExperimentElement = this._getExperimentElement(
          newExperiment.name
        )
        newExperimentElement.setAttribute('active', 'true')

        attemptUrlVariantUpdate(selectedVariant)
      }
    )
  }

  private _getExperimentElement(experimentName: string) {
    return this.getBySelector(`[experiment-name="${experimentName}"]`)
  }
}
