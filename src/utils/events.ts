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
    oldExperimentIndex: number | undefined
    newExperimentIndex: number | undefined
  },
  [EventName.VariantAdded]: {
    variant: Variant
  },
  [EventName.ExperimentRemoved]: {
    experimentIndex: number
  }
}

// Experiment Added
export type ExperimentsAddedEvent = CustomEvent<EventPayload['experimentsAdded']>
export const experimentsAdded = (experiments: Experiment[]) =>
  new CustomEvent<EventPayload['experimentsAdded']>(EventName.ExperimentsAdded, { detail: { experiments }});

// Active Experiment Changed
export type ActiveExperimentChangedEvent = CustomEvent<EventPayload['activeExperimentChanged']>
export const activeExperimentChanged = (oldExperimentIndex: number | undefined, newExperimentIndex: number | undefined) =>
  new CustomEvent<EventPayload['activeExperimentChanged']>(EventName.ActiveExperimentChanged, { detail: { oldExperimentIndex, newExperimentIndex } })

// Variant Added
export type VariantAddedEvent = CustomEvent<EventPayload['variantAdded']>
export const variantAdded = (variant: Variant) =>
  new CustomEvent<EventPayload['variantAdded']>(EventName.VariantAdded, { detail: { variant }})

// Experiment Removed
export type ExperimentRemoved = CustomEvent<EventPayload['experimentRemoved']>
export const experimentRemoved = (experimentIndex: number) =>
  new CustomEvent<EventPayload['experimentRemoved']>(EventName.ExperimentRemoved, { detail: { experimentIndex }})
