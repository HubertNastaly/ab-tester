// saved experiments schema: $active=EX-NAME;EX-NAME-1:VARIANT-B_VARIANT-B-ID,VARIANT-C_VARIANT-C-ID;EX-NAME-2:...

import { SAVED_EXPERIMENTS_KEY } from "../constants";
import { Experiment, Variant } from "../types";

const EXPERIMENTS_SEPARATOR = ";";
const EXPERIMENTS_VARIANTS_SEPARATOR = ":";
const VARIANTS_SEPARATOR = ",";
const VARIANT_NAME_ID_SEPARATOR = "_";
const ACTIVE_VARIANT_PREFIX = '$active='

export async function readSavedExperiments() {
  return (await chrome.storage.local.get(SAVED_EXPERIMENTS_KEY))[
    SAVED_EXPERIMENTS_KEY
  ] as string | undefined;
}

export async function saveExperiments(
  experiments: Experiment[],
  activeExperiment?: Experiment
) {
  const stringifiedExperiments = stringifyExperiments(experiments);
  const allStringified = activeExperiment
    ? [stringifyActiveExperiment(activeExperiment.name), stringifiedExperiments].join(
        EXPERIMENTS_SEPARATOR
      )
    : stringifiedExperiments;

  await chrome.storage.local.set({ [SAVED_EXPERIMENTS_KEY]: allStringified });
}

export async function saveNewExperiment(experimentName: string) {
  const savedExperiments = await readSavedExperiments();
  await chrome.storage.local.set({
    [SAVED_EXPERIMENTS_KEY]: savedExperiments
      ? `${savedExperiments};${experimentName}`
      : experimentName,
  });
}

export function parseSavedExperiments(savedExperiments: string): {
  experiments: Experiment[];
  activeExperiment?: Experiment;
} {
  const parts = savedExperiments.split(EXPERIMENTS_SEPARATOR);
  const hasActiveExperiment = parts[0].startsWith(ACTIVE_VARIANT_PREFIX)
  if (hasActiveExperiment) {
    const activeExperimentName = parseActiveExperimentName(parts[0]);
    const experiments = parts.slice(1).map(parseExperiment);
    const activeExperiment = experiments.find(({ name }) => name === activeExperimentName)
    if(!activeExperiment) {
      throw new Error(`Active experiment not found: ${activeExperimentName}`)
    }
    activeExperiment.selectedVariant = activeExperiment.variants[0]
    return { experiments, activeExperiment };
  }
  return { experiments: parts.map(parseExperiment) };
}

function parseExperiment(experiment: string): Experiment {
  const [name, variants] = experiment.split(EXPERIMENTS_VARIANTS_SEPARATOR);

  const variantsParsed = variants
    ? variants.split(VARIANTS_SEPARATOR).map(parseVariant)
    : [];

  return {
    name,
    variants: variantsParsed,
    selectedVariant: variantsParsed.length > 0 ? variantsParsed[0] : undefined,
  };
}

function parseVariant(variant: string): Variant {
  const [name, id] = variant.split(VARIANT_NAME_ID_SEPARATOR);
  return { name, id };
}

function parseActiveExperimentName(prefixedExperimentName: string): string {
  return prefixedExperimentName.replace(ACTIVE_VARIANT_PREFIX, '')
}

function stringifyExperiments(experiments: Experiment[]): string {
  return experiments
    .map(({ name, variants }) => {
      const variantsStringified = variants
        .map(({ name, id }) => name + VARIANT_NAME_ID_SEPARATOR + id)
        .join(VARIANTS_SEPARATOR);

      return variantsStringified
        ? name + EXPERIMENTS_VARIANTS_SEPARATOR + variantsStringified
        : name;
    })
    .join(EXPERIMENTS_SEPARATOR);
}

function stringifyActiveExperiment(experimentName: string): string {
  return `${ACTIVE_VARIANT_PREFIX}${experimentName}`;
}
