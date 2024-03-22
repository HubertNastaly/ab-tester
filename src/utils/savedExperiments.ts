// saved experiments schema: $active=EX-NAME_VARIANT-ID;EX-NAME-1:VARIANT-B_VARIANT-B-ID,VARIANT-C_VARIANT-C-ID;EX-NAME-2:...

import { Experiment, Variant } from '../types'

const SAVED_EXPERIMENTS_KEY = 'saved_experiments'

const EXPERIMENTS_SEPARATOR = ';'
const EXPERIMENTS_VARIANTS_SEPARATOR = ':'
const VARIANTS_SEPARATOR = ','
const VARIANT_NAME_ID_SEPARATOR = '_'
const EXPERIMENT_VARIANT_ID_SEPARATOR = '_'
const ACTIVE_VARIANT_PREFIX = '$active='

export async function readSavedExperiments() {
  return (await chrome.storage.local.get(SAVED_EXPERIMENTS_KEY))[
    SAVED_EXPERIMENTS_KEY
  ] as string | undefined
}

export async function saveExperiments(
  experiments: Experiment[],
  activeExperiment?: Experiment
) {
  const stringifiedExperiments = stringifyExperiments(experiments)
  const stringifiedActiveExperiment =
    activeExperiment &&
    activeExperiment.selectedVariant &&
    stringifyActiveExperiment(
      activeExperiment.name,
      activeExperiment.selectedVariant.id
    )
  const allStringified = stringifiedActiveExperiment
    ? [stringifiedActiveExperiment, stringifiedExperiments].join(
        EXPERIMENTS_SEPARATOR
      )
    : stringifiedExperiments

  await chrome.storage.local.set({ [SAVED_EXPERIMENTS_KEY]: allStringified })
}

export async function saveNewExperiment(experimentName: string) {
  const savedExperiments = await readSavedExperiments()
  await chrome.storage.local.set({
    [SAVED_EXPERIMENTS_KEY]: savedExperiments
      ? `${savedExperiments};${experimentName}`
      : experimentName,
  })
}

export function parseSavedExperiments(savedExperiments: string): {
  experiments: Experiment[]
  activeExperiment?: Experiment
} {
  const parts = savedExperiments.split(EXPERIMENTS_SEPARATOR)
  const hasActiveExperiment = parts[0].startsWith(ACTIVE_VARIANT_PREFIX)
  if (hasActiveExperiment) {
    const { experimentName, variantId } = parseActiveExperiment(parts[0])
    const experiments = parts.slice(1).map(parseExperiment)
    const activeExperiment = experiments.find(
      ({ name }) => name === experimentName
    )
    if (!activeExperiment) {
      throw new Error(`Active experiment not found: ${experimentName}`)
    }
    activeExperiment.selectedVariant = activeExperiment.variants.find(
      ({ id }) => id === variantId
    )
    return { experiments, activeExperiment }
  }
  return { experiments: parts.map(parseExperiment) }
}

function parseExperiment(experiment: string): Experiment {
  const [name, variants] = experiment.split(EXPERIMENTS_VARIANTS_SEPARATOR)

  const variantsParsed = variants
    ? variants.split(VARIANTS_SEPARATOR).map(parseVariant)
    : []

  return {
    name,
    variants: variantsParsed,
    selectedVariant: variantsParsed.length > 0 ? variantsParsed[0] : undefined,
  }
}

function parseVariant(variant: string): Variant {
  const [name, id] = variant.split(VARIANT_NAME_ID_SEPARATOR)
  return { name, id }
}

function parseActiveExperiment(prefixedExperimentName: string): {
  experimentName: string
  variantId: string
} {
  const [experimentName, variantId] = prefixedExperimentName
    .replace(ACTIVE_VARIANT_PREFIX, '')
    .split(EXPERIMENT_VARIANT_ID_SEPARATOR)
  return { experimentName, variantId }
}

function stringifyExperiments(experiments: Experiment[]): string {
  return experiments
    .map(({ name, variants }) => {
      const variantsStringified = variants
        .map(({ name, id }) => name + VARIANT_NAME_ID_SEPARATOR + id)
        .join(VARIANTS_SEPARATOR)

      return variantsStringified
        ? name + EXPERIMENTS_VARIANTS_SEPARATOR + variantsStringified
        : name
    })
    .join(EXPERIMENTS_SEPARATOR)
}

function stringifyActiveExperiment(
  experimentName: string,
  variantId: string
): string {
  return `${ACTIVE_VARIANT_PREFIX}${experimentName}_${variantId}`
}
