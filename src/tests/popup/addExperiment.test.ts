import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { SELECTORS, Tester } from '../utils'

describe('add experiment', () => {
  let tester: Tester

  const fillExperimentName = async (experimentName: string) =>
    tester.waitForAndFill(SELECTORS.addExperimentInput, experimentName)
  const getExperimentNameInputValue = async () =>
    tester.getInputValue(SELECTORS.addExperimentInput)
  const clickAddExperiment = async () => {
    const addButton = await tester.getByText('Add')
    await addButton.click()
  }
  const isAddButtonDisabled = async () =>
    tester.isButtonDisabled(SELECTORS.addExperimentButton)

  beforeEach(async () => {
    tester = await Tester.create()
  })

  afterEach(async () => {
    await tester.close()
  })

  test('cannot add without name', async () => {
    await clickAddExperiment()

    expect(await isAddButtonDisabled()).toBe(true)
    await expect(tester.getByText('Activate')).rejects.toThrow()

    await fillExperimentName('EX-123')
    expect(await isAddButtonDisabled()).toBe(false)
  })

  test('only unique names', async () => {
    await fillExperimentName('EX-123')
    await clickAddExperiment()

    await fillExperimentName('EX-123')
    expect(await isAddButtonDisabled()).toBe(true)
  })

  test('can add with unique name', async () => {
    await expect(tester.getByText('Activate')).rejects.toThrow()

    await fillExperimentName('EX-123')
    await clickAddExperiment()

    expect(await tester.getByText('Activate')).toBeDefined()
    expect(await tester.getByText('EX-123')).toBeDefined()
  })

  test('clears input after experiment added', async () => {
    await fillExperimentName('EX-123')
    expect(await getExperimentNameInputValue()).toBe('EX-123')

    await clickAddExperiment()

    expect(await getExperimentNameInputValue()).toBe('')
  })

  test('disables Add button once experiment is added', async () => {
    await fillExperimentName('EX-123')
    await clickAddExperiment()
    expect(await isAddButtonDisabled()).toBe(true)
  })
})
