import { Experiment, RecuirsiveReadonly, Variant } from "../types"
import { activeExperimentChanged, experimentRemoved, experimentsAdded, selectedVariantChanged, variantAdded } from "./events"
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

  public read(): RecuirsiveReadonly<InternalStore> {
    // TODO: freeze
    // return Object.freeze(this._store)
    return this._store
  }

  public getExperiment(experimentName: string): RecuirsiveReadonly<Experiment> {
    return this._getExperiment(experimentName)
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
    const experimentIndex = this._store.experiments.findIndex(({ name }) => name === experimentName)
    if(experimentIndex === -1) {
      throw new Error(`Cannot find experiment: ${experimentName}`)
    }
    return experimentIndex
  }

  private _getExperiment(experimentName: string) {
    const experiment = this._store.experiments.find(({ name }) => name === experimentName)
    if(!experiment) {
      throw new Error(`Experiment ${experimentName} does not exist`)
    }
    return experiment
  }

  public setActiveExperiment(newExperimentName: string | undefined) {
    const oldExperiment = this._store.activeExperiment
    const newExperiment = newExperimentName ? this._getExperiment(newExperimentName) : undefined

    this._store.activeExperiment = newExperiment

    this._save()
    observer.port(PORT_IDS.global).emit(activeExperimentChanged(oldExperiment, newExperiment))
  }

  public pushExperiments(experiments: Experiment[]) {
    this._store.experiments.push(...experiments)
    this._save()
    observer.port(PORT_IDS.global).emit(experimentsAdded(experiments))
  }

  public removeExperiment(experimentName: string) {
    const experimentIndex = this._findExperimentIndex(experimentName)

    if(this._store.activeExperiment?.name === experimentName) {
      this.setActiveExperiment(undefined)
    }
    this._store.experiments.splice(experimentIndex, 1)

    this._save()
    observer.port(PORT_IDS.global).emit(experimentRemoved(experimentName))
  }

  public pushVariants(experimentName: string, variant: Variant) {
    const experimentIndex = this._findExperimentIndex(experimentName)
    const experiment = this._store.experiments[experimentIndex]

    experiment.variants.push(variant)
    if(!experiment.selectedVariant) {
      experiment.selectedVariant = variant
    }

    this._save()
    observer.port(PORT_IDS.experiment(experimentName)).emit(variantAdded(variant))
  }

  public selectVariant(experimentName: string, variant: Variant) {
    // TODO: change for _getExperiment
    const experimentIndex = this._findExperimentIndex(experimentName)

    this._store.experiments[experimentIndex].selectedVariant = variant

    this._save()
    observer.port(PORT_IDS.experiment(experimentName)).emit(selectedVariantChanged(experimentName, variant))
  }
}

export const store = new Store()
