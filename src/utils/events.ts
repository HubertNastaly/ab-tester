import { Experiment, Variant } from "../types"

export enum EventName {
  ExperimentsAdded = 'experimentsAdded',
  ActiveExperimentChanged = 'activeExperimentChanged',
  VariantAdded = 'variantAdded',
  ExperimentRemoved = 'experimentRemoved'
}

export interface EventPayload {
  [EventName.ExperimentsAdded]: {
    experiments: Experiment[]
  },
  [EventName.ActiveExperimentChanged]: {
    oldExperiment: Experiment | undefined
    newExperiment: Experiment | undefined
  },
  [EventName.VariantAdded]: {
    variant: Variant
  },
  [EventName.ExperimentRemoved]: {
    experimentName: string
  }
}

// Experiment Added
export type ExperimentsAddedEvent = CustomEvent<EventPayload['experimentsAdded']>
export const experimentsAdded = (experiments: Experiment[]) =>
  new CustomEvent<EventPayload['experimentsAdded']>(EventName.ExperimentsAdded, { detail: { experiments }});

// Active Experiment Changed
export type ActiveExperimentChangedEvent = CustomEvent<EventPayload['activeExperimentChanged']>
export const activeExperimentChanged = (oldExperiment: Experiment | undefined, newExperiment: Experiment | undefined) =>
  new CustomEvent<EventPayload['activeExperimentChanged']>(EventName.ActiveExperimentChanged, { detail: { oldExperiment, newExperiment } })

// Variant Added
export type VariantAddedEvent = CustomEvent<EventPayload['variantAdded']>
export const variantAdded = (variant: Variant) =>
  new CustomEvent<EventPayload['variantAdded']>(EventName.VariantAdded, { detail: { variant }})

// Experiment Removed
export type ExperimentRemoved = CustomEvent<EventPayload['experimentRemoved']>
export const experimentRemoved = (experimentName: string) =>
  new CustomEvent<EventPayload['experimentRemoved']>(EventName.ExperimentRemoved, { detail: { experimentName }})
