import './style.css'
import { ExperimentElement } from './experiment'
import { AddExperiment } from './addExperiment'
import { Experiments } from './experiments'
import { AddVariant } from './addVariant'
import { RemoveExperiment } from './removeExperiment'

customElements.define(Experiments.htmlTag, Experiments)
customElements.define(ExperimentElement.htmlTag, ExperimentElement)
customElements.define(AddExperiment.htmlTag, AddExperiment)
customElements.define(AddVariant.htmlTag, AddVariant)
customElements.define(RemoveExperiment.htmlTag, RemoveExperiment)

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h2>🧪 AB Tester</h2>
  <custom-experiments></custom-experiments>
  <add-experiment />
`
