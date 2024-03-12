import { ExtendedHtmlElement } from "../utils/ExtendedHtmlElement";
import { store } from "../utils/store";

export class RemoveExperiment extends ExtendedHtmlElement {
  private experimentIndex: number

  constructor(_experimentIndex: number) {
    super('remove-experiment')
    this.experimentIndex = _experimentIndex;
  }

  connectedCallback() {
    this.createFromTemplate()
    this.listenToRemoveClick()
  }

  private listenToRemoveClick() {
    this.getBySelector('button').addEventListener('click', async () => {
      store.removeExperiment(this.experimentIndex)
    })
  }
}
