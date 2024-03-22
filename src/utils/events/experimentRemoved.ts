export const EXPERIMENT_REMOVED_EVENT_NAME = 'experimentRemoved'

export interface ExperimentRemovedPayload {
  experimentName: string
}

export type ExperimentRemovedEvent = CustomEvent<ExperimentRemovedPayload>
export const experimentRemoved = (experimentName: string) =>
  new CustomEvent<ExperimentRemovedPayload>(EXPERIMENT_REMOVED_EVENT_NAME, { detail: { experimentName }})
