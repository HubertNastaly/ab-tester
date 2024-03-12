import { Experiment, Variant } from "../types"
import { activeExperimentChanged, experimentRemoved, experimentsAdded, variantAdded } from "./events"
import { observer } from "./observer"
import { PORT_IDS } from "./portIds"
import { saveExperiments } from "./savedExperiments"

interface InternalStore {
  experiments: Experiment[]
  activeExperiment?: Experiment
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
    const { experiments, activeExperiment } = this._store
    if(!activeExperiment) {
      saveExperiments(experiments)
      return
    }
  
    saveExperiments(experiments, activeExperiment)
  }

  private _findExperimentIndex(experimentName: string | undefined) {
    if(!experimentName) return -1;
    return this._store.experiments.findIndex(({ name }) => name === experimentName)
  }

  public findExperiment(experimentName: string | undefined) {
    if(!experimentName) return undefined
    return this._store.experiments.find(({ name }) => name === experimentName)
  }

  public setActiveExperiment(newExperimentName: string | undefined) {
    // const oldExperimentName = this._store.activeVariant?.experimentName
    const oldExperiment = this._store.activeExperiment
    const newExperiment = this.findExperiment(newExperimentName)

    if(!newExperiment) {
      this._store.activeExperiment = undefined
    } else {
      if(!newExperiment.activeVariantId) {
        throw new Error(`Missing variant id for activated experiment: ${newExperimentName}`)
      }
      this._store.activeExperiment = newExperiment
    }

    this._save()
    observer.port(PORT_IDS.global).emit(activeExperimentChanged(oldExperiment, newExperiment))
  }

  public pushExperiments(experiments: Experiment[]) {
    this._store.experiments.push(...experiments)
    // TODO: save store
    observer.port(PORT_IDS.global).emit(experimentsAdded(experiments))
  }

  public removeExperiment(experimentName: string) {
    const experimentIndex = this._findExperimentIndex(experimentName)
    if(experimentIndex === -1) {
      throw new Error(`Cannot remove experiment: ${experimentName} as it doesn't exist`)
    }

    if(this._store.activeExperiment?.name === experimentName) {
      this.setActiveExperiment(undefined)
    }
    this._store.experiments.splice(experimentIndex, 1)

    this._save()
    observer.port(PORT_IDS.global).emit(experimentRemoved(experimentName))
  }

  public pushVariants(experimentName: string, variant: Variant) {
    const experimentIndex = this._findExperimentIndex(experimentName)
    if(experimentIndex === -1) {
      throw new Error(`Cannot find experiment: ${experimentName}`)
    }

    const experiment = this._store.experiments[experimentIndex]
    experiment.variants.push(variant)
    if(!experiment.activeVariantId) {
      experiment.activeVariantId = variant.id
    }

    this._save()
    observer.port(PORT_IDS.experiment(experimentName)).emit(variantAdded(variant))
  }
}

export const store = new Store()
