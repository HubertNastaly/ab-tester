import { EventName } from "../utils/events";
import { observer } from "../utils/observer";
import { PORT_IDS } from "../utils/portIds";
import { parseSavedExperiments, readSavedExperiments } from "../utils/savedExperiments";
import { store } from "../utils/store";
import { getCurrentUrlVariantId, updateUrl } from "../utils/url";
import { clearVariantQuery, withVariantQuery } from "../utils/withVariantQuery";
import { ExperimentElement } from "./experiment";

// TODO: do not rely on experiment index (use name or id)
export class Experiments extends HTMLElement {
  constructor() {
    super();
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
      store.setActiveExperimentIndex(activeVariant.experimentIndex)
    }
  }

  private listenOnNewExperiments() {
    observer.port(PORT_IDS.global).observe(EventName.ExperimentsAdded, ({ experiments }) => {
      const experimentNodeCount = this.children.length
      experiments.forEach(({ name, variants }, index) => {
        const newExperiment = new ExperimentElement(experimentNodeCount + index, name, variants)
        this.appendChild(newExperiment)
      })
    })
  }

  private listenOnExperimentRemoved() {
    observer.port(PORT_IDS.global).observe(EventName.ExperimentRemoved, ({ experimentIndex }) => {
      this.removeChild(this.childNodes.item(experimentIndex))
    })
  }

  private listenOnActiveExperimentChange() {
    observer.port(PORT_IDS.global).observe(EventName.ActiveExperimentChanged, async ({ oldExperimentIndex, newExperimentIndex }) => {
      const experimentElements = this.querySelectorAll('custom-experiment')
      if(oldExperimentIndex !== undefined) {
        experimentElements[oldExperimentIndex].removeAttribute('active')
      }

      const { experiments } = store.read()

      if(newExperimentIndex === undefined) {
        // saveExperiments(experiments)
        await updateUrl((currentUrl) => clearVariantQuery(currentUrl))
        return
      }

      const { activeVariantId } = experiments[newExperimentIndex]
      if(activeVariantId === undefined) return;

      experimentElements[newExperimentIndex].setAttribute('active', 'true')
      
      // saveExperiments(experiments, {
      //   experimentIndex: newExperimentIndex,
      //   variantIndex: activeVariantIndex
      // })
      
      // const activeVariantId = variants[activeVariantIndex].id
      const currentUrlVariantId = await getCurrentUrlVariantId()
      if(activeVariantId !== currentUrlVariantId) {
        updateUrl((currentUrl) => withVariantQuery(currentUrl, activeVariantId))
      }
    })
  }
}
