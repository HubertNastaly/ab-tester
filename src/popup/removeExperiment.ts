import { Experiment } from "../types";
import { ExtendedHtmlElement } from "../utils/ExtendedHtmlElement";
import { store } from "../utils/store";

export class RemoveExperiment extends ExtendedHtmlElement {
  private readonly experiment: Experiment

  constructor(_experiment: Readonly<Experiment>) {
    super('remove-experiment')
    this.experiment = _experiment;
  }

  connectedCallback() {
    this.createFromTemplate()
    this.listenToRemoveClick()
  }

  private listenToRemoveClick() {
    this.getBySelector('button').addEventListener('click', async () => {
      store.removeExperiment(this.experiment.name)
    })
  }
}
