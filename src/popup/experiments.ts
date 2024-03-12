import { ExtendedHtmlElement } from "../utils/ExtendedHtmlElement";
import { EventName } from "../utils/events";
import { observer } from "../utils/observer";
import { PORT_IDS } from "../utils/portIds";
import { parseSavedExperiments, readSavedExperiments } from "../utils/savedExperiments";
import { store } from "../utils/store";
import { getCurrentUrlVariantId, updateUrl } from "../utils/url";
import { clearVariantQuery, withVariantQuery } from "../utils/withVariantQuery";
import { ExperimentElement } from "./experiment";

export class Experiments extends ExtendedHtmlElement {
  constructor() {
    super('experiments-template');
    this.listenOnNewExperiments()
    this.listenOnExperimentRemoved()
    this.listenOnActiveExperimentChange()
    this.populateSavedExperiments()
  }

  private async populateSavedExperiments() {
    const savedExperiments = await readSavedExperiments()
    if(!savedExperiments) return;

    const { experiments, activeVariant } = parseSavedExperiments(savedExperiments)
    store.pushExperiments(experiments)
    if(activeVariant) {
      store.setActiveExperiment(activeVariant.experimentName)
    }
  }

  private listenOnNewExperiments() {
    observer.port(PORT_IDS.global).observe(EventName.ExperimentsAdded, ({ experiments }) => {
      experiments.forEach(({ name, variants }) => {
        const newExperiment = new ExperimentElement(name, variants)
        this.appendChild(newExperiment)
      })
    })
  }

  private listenOnExperimentRemoved() {
    observer.port(PORT_IDS.global).observe(EventName.ExperimentRemoved, ({ experimentName }) => {
      const experiment = this._getExperimentElement(experimentName)
      this.removeChild(experiment)
    })
  }

  private listenOnActiveExperimentChange() {
    observer.port(PORT_IDS.global).observe(EventName.ActiveExperimentChanged, async ({ oldExperiment, newExperiment }) => {
      if(oldExperiment) {
        const oldExperimentElement = this._getExperimentElement(oldExperiment.name)
        oldExperimentElement.removeAttribute('active')
      }

      if(!newExperiment) {
        await updateUrl((currentUrl) => clearVariantQuery(currentUrl))
        return
      }

      const { activeVariantId } = newExperiment
      if(!activeVariantId) return;

      const newExperimentElement = this._getExperimentElement(newExperiment.name)
      newExperimentElement.setAttribute('active', 'true')

      const currentUrlVariantId = await getCurrentUrlVariantId()
      if(activeVariantId !== currentUrlVariantId) {
        updateUrl((currentUrl) => withVariantQuery(currentUrl, activeVariantId))
      }
    })
  }

  private _getExperimentElement(experimentName: string) {
    return this.getBySelector(`[experiment-name="${experimentName}"]`)
  }
}
