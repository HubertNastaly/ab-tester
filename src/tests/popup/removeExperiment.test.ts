import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { SELECTORS, Tester } from '../utils'
import { EXPERIMENTS_MOCK } from '../mocks'

describe('removeExperiment', () => {
  let tester: Tester
  const experiment = EXPERIMENTS_MOCK[1]

  const clickRemoveExperiment = async () => tester.waitForAndClick(SELECTORS.removeExperimentButton(experiment.name))
  const confirmRemoveExperiment = async () => {
    const confirmButton = await tester.getByText('Remove experiment')
    await confirmButton.click()
  }

  beforeEach(async () => {
    tester = await Tester.create()
    await tester.addExperiments([experiment])
  })

  afterEach(async () => {
    await tester.close()
  })

  test('can toggle remove experiment panel', async () => {
    await clickRemoveExperiment()
    expect(await tester.getByText('Remove experiment')).toBeDefined()

    await clickRemoveExperiment()
    await expect(tester.getByText('Remove experiment')).rejects.toThrow()
  })

  test('can remove experiment', async () => {
    await clickRemoveExperiment()
    await confirmRemoveExperiment()
    await expect(tester.getByText(experiment.name)).rejects.toThrow()
  })
})
