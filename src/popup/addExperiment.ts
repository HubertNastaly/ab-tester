import { ExtendedHtmlElement } from "../utils/ExtendedHtmlElement";
import { saveNewExperiment } from "../utils/savedExperiments";
import { store } from "../utils/store";

export class AddExperiment extends ExtendedHtmlElement {
  constructor() {
    super('add-experiment-template');
  }

  async connectedCallback() {
    super.createFromTemplate()
    this.listenOnSubmit()
    this.listenOnInput()
  }

  private listenOnInput() {
    const input = this.getHtmlElement('input')

    input.addEventListener('input', (event) => {
      const { value } = event.target as HTMLInputElement
      const addButton = this.getHtmlElement('button')

      const shouldDisableAddButton = !value || store.read().experiments.some(({ name }) => name === value)

      if(shouldDisableAddButton) {
        addButton.setAttribute('disabled', 'true')
      } else {
        addButton.removeAttribute('disabled')
      }
    })
  }

  private listenOnSubmit() {
    const addExperimentForm = this.getHtmlElement('form')

    addExperimentForm.addEventListener('submit', async (event) => {
      event.preventDefault()

      const input = this.getHtmlElement('input')
      const experimentName = input.value

      await saveNewExperiment(experimentName)

      store.pushExperiments([{
        name: experimentName,
        variants: [],
        // activeVariantId: 0
      }])

      input.value = ''
      this.getHtmlElement('button').setAttribute('disabled', 'true')
    })
  }
}
