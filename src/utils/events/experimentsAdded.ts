import { Experiment } from "../../types";

export const EXPERIMENT_ADDED_EVENT_NAME = 'experimentsAdded'

export interface ExperimentsAddedPayload {
  experiments: Experiment[]
}

export type ExperimentsAddedEvent = CustomEvent<ExperimentsAddedPayload>
export const experimentsAdded = (experiments: Experiment[]) =>
  new CustomEvent<ExperimentsAddedPayload>(EXPERIMENT_ADDED_EVENT_NAME, { detail: { experiments }});
