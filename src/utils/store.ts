import { Experiment, Variant } from "../types"
import { activeExperimentChanged, experimentRemoved, experimentsAdded, variantAdded } from "./events"
import { observer } from "./observer"
import { PORT_IDS } from "./portIds"
import { saveExperiments } from "./savedExperiments"

interface InternalStore {
  experiments: Experiment[]
  activeExperimentIndex?: number
}

export class Store {
  private _store: InternalStore

  constructor() {
    this._store = {
      experiments: []
    }
  }

  public read(): Readonly<InternalStore> {
    // TODO: freeze
    // return Object.freeze(this._store)
    return this._store
  }

  private _save() {
    const { experiments, activeExperimentIndex } = this._store
    if(activeExperimentIndex === undefined) {
      saveExperiments(experiments)
      return
    }
  
    const { activeVariantId } = experiments[activeExperimentIndex]
    if(activeVariantId === undefined) {
      throw new Error('Active experiment has no active variant')
    }
  
    saveExperiments(experiments, {
      experimentIndex: activeExperimentIndex,
      variantId: activeVariantId
    })
  }

  public setActiveExperimentIndex(newIndex: number | undefined) {
    const oldIndex = this._store.activeExperimentIndex
    this._store.activeExperimentIndex = newIndex
    this._save()
    observer.port(PORT_IDS.global).emit(activeExperimentChanged(oldIndex, newIndex))
  }

  public pushExperiments(experiments: Experiment[]) {
    this._store.experiments.push(...experiments)
    observer.port(PORT_IDS.global).emit(experimentsAdded(experiments))
  }

  public removeExperiment(experimentIndex: number) {
    this._store.experiments.splice(experimentIndex, 1)
    if(this._store.activeExperimentIndex === experimentIndex) {
      this.setActiveExperimentIndex(undefined)
    }
    this._save()
    observer.port(PORT_IDS.global).emit(experimentRemoved(experimentIndex))
  }

  public pushVariants(experimentIndex: number, variant: Variant) {
    const experiment = this._store.experiments[experimentIndex]
    experiment.variants.push(variant)
    if(!experiment.activeVariantId) {
      experiment.activeVariantId = variant.id
    }
    this._save()
    observer.port(PORT_IDS.experiment(experimentIndex)).emit(variantAdded(variant))
  }
}

export const store = new Store()
