import { Experiment } from '../../types'

export const ACTIVE_EXPERIMENT_CHANGED_EVENT_NAME = 'activeExperimentChanged'

export interface ActiveExperimentChangedPayload {
  oldExperiment: Experiment | undefined
  newExperiment: Experiment | undefined
}

export type ActiveExperimentChangedEvent =
  CustomEvent<ActiveExperimentChangedPayload>
export const activeExperimentChanged = (
  oldExperiment: Experiment | undefined,
  newExperiment: Experiment | undefined
) =>
  new CustomEvent<ActiveExperimentChangedPayload>(
    ACTIVE_EXPERIMENT_CHANGED_EVENT_NAME,
    { detail: { oldExperiment, newExperiment } }
  )
