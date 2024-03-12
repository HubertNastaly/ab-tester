import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { SELECTORS, Tester } from '../utils'

describe('add experiment', () => {
  let tester: Tester

  beforeEach(async () => {
    tester = await Tester.create()
  })

  afterEach(async () => {
    await tester.close()
  })

  test('cannot add without name', async () => {
    const addButton = await tester.getByText('Add')
    await addButton.click()

    expect(await tester.isButtonDisabled(SELECTORS.addExperimentButton)).toBe(true)
    await expect(tester.getByText('Activate')).rejects.toThrow()

    await tester.waitForAndFill(SELECTORS.addExperimentInput, 'EX-123')
    expect(await tester.isButtonDisabled(SELECTORS.addExperimentButton)).toBe(false)
  })

  test('only unique names', async () => {
    await tester.waitForAndFill(SELECTORS.addExperimentInput, 'EX-123')
    const addButton = await tester.getByText('Add')
    await addButton.click()

    await tester.waitForAndFill(SELECTORS.addExperimentInput, 'EX-123')
    expect(await tester.isButtonDisabled(SELECTORS.addExperimentButton)).toBe(true)
  })

  test('can add with unique name', async () => {
    await expect(tester.getByText('Activate')).rejects.toThrow()

    await tester.waitForAndFill(SELECTORS.addExperimentInput, 'EX-123')
    const addButton = await tester.getByText('Add')
    await addButton.click()

    expect(await tester.getByText('Activate')).toBeDefined()
    expect(await tester.getByText('EX-123')).toBeDefined()
  })

  test('clears input after experiment added', async () => {
    await tester.waitForAndFill(SELECTORS.addExperimentInput, 'EX-123')
    expect(await tester.getInputValue(SELECTORS.addExperimentInput)).toBe('EX-123')

    const addButton = await tester.getByText('Add')
    await addButton.click()

    expect(await tester.getInputValue(SELECTORS.addExperimentInput)).toBe('')
  })

  test('disables Add button once experiment is added', async () => {
    await tester.waitForAndFill(SELECTORS.addExperimentInput, 'EX-123')
    const addButton = await tester.getByText('Add')
    await addButton.click()
    expect(await tester.isButtonDisabled(SELECTORS.addExperimentButton)).toBe(true)
  })
})
