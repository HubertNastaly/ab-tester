import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { SELECTORS, Tester } from '../utils'
import { Variant } from '../../types'

describe('add variant', () => {
  let tester: Tester

  const experimentName = 'EX-123'
  const variant: Variant = {
    name: 'B',
    id: '1234567890'
  }

  const variantIdInputSelector = SELECTORS.variantIdInput(experimentName)
  const variantNameInputSelector = SELECTORS.variantNameInput(experimentName)
  const toggleVariantFormButtonSelector = SELECTORS.addVariantButton(experimentName)
  const submitVariantButtonSelector = SELECTORS.submitVariantButton(experimentName)
  const variantSelectSelector = SELECTORS.variantSelect(experimentName)
  const optionSelector = `${variantSelectSelector} option`

  async function mockExperiment() {
    await tester.waitForAndFill(SELECTORS.addExperimentInput, experimentName);
    await tester.waitForEnabled(SELECTORS.addExperimentButton)
    await tester.click(SELECTORS.addExperimentButton)
  }

  beforeEach(async () => {
    tester = await Tester.create()
    await mockExperiment()
    await tester.waitForAndClick(toggleVariantFormButtonSelector)
  })

  afterEach(async () => {
    await tester.close()
  })

  test('variant name is required', async () => {
    await tester.waitForAndFill(variantIdInputSelector, variant.id)
    expect(await tester.isButtonDisabled(submitVariantButtonSelector)).toBe(true)
  })

  test('variant id is required', async () => {
    await tester.waitForAndFill(variantNameInputSelector, variant.name)
    expect(await tester.isButtonDisabled(submitVariantButtonSelector)).toBe(true)
  })

  test('enables submit button once all fields are provided', async () => {
    await tester.waitForAndFill(variantNameInputSelector, variant.name)
    await tester.waitForAndFill(variantIdInputSelector, variant.id)

    expect(await tester.isButtonDisabled(submitVariantButtonSelector)).toBe(false)
  })

  test('adds variant', async () => {
    await tester.waitForAndFill(variantNameInputSelector, variant.name)
    await tester.waitForAndFill(variantIdInputSelector, variant.id)
    await tester.page.click(submitVariantButtonSelector)
    
    expect(await tester.getTextContent(optionSelector)).toBe('B (1234567890)')
  })

  test('clears inputs after adding variants', async () => {
    await tester.waitForAndFill(variantNameInputSelector, variant.name)
    await tester.waitForAndFill(variantIdInputSelector, variant.id)
    await tester.waitForAndClick(submitVariantButtonSelector)

    await tester.waitForAndClick(toggleVariantFormButtonSelector)

    expect(await tester.getTextContent(variantNameInputSelector)).toBe('')
    expect(await tester.getTextContent(variantIdInputSelector)).toBe('')
  })

  test('can add another variant', async () => {
    await tester.waitForAndFill(variantNameInputSelector, variant.name)
    await tester.waitForAndFill(variantIdInputSelector, variant.id)
    await tester.waitForAndClick(submitVariantButtonSelector)

    await tester.waitForAndClick(toggleVariantFormButtonSelector)

    const anotherVariant: Variant = {
      name: 'C',
      id: '0987654321'
    }
    await tester.waitForAndFill(variantNameInputSelector, anotherVariant.name)
    await tester.waitForAndFill(variantIdInputSelector, anotherVariant.id)
    await tester.waitForAndClick(submitVariantButtonSelector)

    const optionLabels = await tester.page.$$eval(optionSelector, options => options.map(({ textContent }) => textContent))
    expect(optionLabels.length).toBe(2)
    expect(optionLabels[0]).toBe('B (1234567890)')
    expect(optionLabels[1]).toBe('C (0987654321)')
  })

  test('hides form on second plus button click', async () => {
    expect(await tester.page.$(variantNameInputSelector)).toBeDefined()
    await tester.waitForAndClick(toggleVariantFormButtonSelector)
    expect(await tester.page.$(variantNameInputSelector)).toBeNull()
  })
})
