import {
  ACTIVE_EXPERIMENT_CHANGED_EVENT_NAME,
  ActiveExperimentChangedPayload,
} from './activeExperimentsChangedEvent'

import {
  EXPERIMENT_REMOVED_EVENT_NAME,
  ExperimentRemovedPayload,
} from './experimentRemoved'
import {
  EXPERIMENT_ADDED_EVENT_NAME,
  ExperimentsAddedPayload,
} from './experimentsAdded'
import {
  SELECTED_VARIANT_CHANGED_EVENT_NAME,
  SelectedVariantChangedPayload,
} from './selectedVariantChangedEvent'
import { VARIANT_ADDED_EVENT_NAME, VariantAddedPayload } from './variantAdded'
export { activeExperimentChanged } from './activeExperimentsChangedEvent'
export { experimentRemoved } from './experimentRemoved'
export { experimentsAdded } from './experimentsAdded'
export { selectedVariantChanged } from './selectedVariantChangedEvent'
export { variantAdded } from './variantAdded'

enum EventName {
  ExperimentsAdded = EXPERIMENT_ADDED_EVENT_NAME,
  ActiveExperimentChanged = ACTIVE_EXPERIMENT_CHANGED_EVENT_NAME,
  VariantAdded = VARIANT_ADDED_EVENT_NAME,
  ExperimentRemoved = EXPERIMENT_REMOVED_EVENT_NAME,
  SelectedVariantChanged = SELECTED_VARIANT_CHANGED_EVENT_NAME,
}

interface EventPayload {
  [EventName.ActiveExperimentChanged]: ActiveExperimentChangedPayload
  [EventName.ExperimentRemoved]: ExperimentRemovedPayload
  [EventName.ExperimentsAdded]: ExperimentsAddedPayload
  [EventName.SelectedVariantChanged]: SelectedVariantChangedPayload
  [EventName.VariantAdded]: VariantAddedPayload
}

export { EventName, type EventPayload }
