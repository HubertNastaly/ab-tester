import './style.css'
import { ExperimentElement } from './experiment'
import { AddExperiment } from './addExperiment'
import { Experiments } from './experiments'
import { AddVariant } from './addVariant'
import { RemoveExperiment } from './removeExperiment'

customElements.define('custom-experiments', Experiments)
customElements.define('custom-experiment', ExperimentElement)
customElements.define('add-experiment', AddExperiment)
customElements.define('add-variant', AddVariant)
customElements.define('remove-experiment', RemoveExperiment)

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h2>🧪 AB Tester</h2>
  <custom-experiments></custom-experiments>
  <add-experiment />
`
