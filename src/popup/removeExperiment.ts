import { ExtendedHtmlElement } from "../utils/ExtendedHtmlElement";
import { store } from "../utils/store";

export class RemoveExperiment extends ExtendedHtmlElement {
  private experimentName: string

  constructor(_experimentName: string) {
    super('remove-experiment')
    this.experimentName = _experimentName;
  }

  connectedCallback() {
    this.createFromTemplate()
    this.listenToRemoveClick()
  }

  private listenToRemoveClick() {
    this.getBySelector('button').addEventListener('click', async () => {
      store.removeExperiment(this.experimentName)
    })
  }
}
