import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { SELECTORS, Tester } from '../utils'
import { Variant } from '../../types'

describe('add variant', () => {
  let tester: Tester

  const experimentName = 'EX-123'
  const variant: Variant = {
    name: 'B',
    id: '1234567890',
  }

  const variantIdInputSelector = SELECTORS.variantIdInput(experimentName)
  const variantNameInputSelector = SELECTORS.variantNameInput(experimentName)
  const optionSelector = `${SELECTORS.variantSelect(experimentName)} option`

  const fillVariantId = async (id: string) =>
    tester.waitForAndFill(variantIdInputSelector, id)
  const fillVariantName = async (name: string) =>
    tester.waitForAndFill(variantNameInputSelector, name)
  const isSubmitVariantDisabled = async () =>
    tester.isButtonDisabled(SELECTORS.submitVariantButton(experimentName))
  const clickOpenVariantForm = async () =>
    tester.waitForAndClick(SELECTORS.addVariantButton(experimentName))
  const clickSubmitVariantButton = async () =>
    tester.waitForAndClick(SELECTORS.submitVariantButton(experimentName))

  beforeEach(async () => {
    tester = await Tester.create()
    await tester.addExperiments([{ name: experimentName, variants: [] }])
  })

  afterEach(async () => {
    await tester.close()
  })

  test('variant name is required', async () => {
    await clickOpenVariantForm()
    await fillVariantId(variant.id)
    expect(await isSubmitVariantDisabled()).toBe(true)
  })

  test('variant id is required', async () => {
    await clickOpenVariantForm()
    await fillVariantName(variant.name)
    expect(await isSubmitVariantDisabled()).toBe(true)
  })

  test('enables submit button once all fields are provided', async () => {
    await clickOpenVariantForm()
    await fillVariantId(variant.id)
    await fillVariantName(variant.name)
    expect(await isSubmitVariantDisabled()).toBe(false)
  })

  test('adds variant', async () => {
    await clickOpenVariantForm()
    await fillVariantId(variant.id)
    await fillVariantName(variant.name)
    await clickSubmitVariantButton()
    expect(await tester.getTextContent(optionSelector)).toBe('B (1234567890)')
  })

  test('clears inputs after adding variants', async () => {
    await clickOpenVariantForm()
    await fillVariantId(variant.id)
    await fillVariantName(variant.name)
    await clickSubmitVariantButton()

    await clickOpenVariantForm()

    expect(await tester.getTextContent(variantNameInputSelector)).toBe('')
    expect(await tester.getTextContent(variantIdInputSelector)).toBe('')
  })

  test('can add another variant', async () => {
    await clickOpenVariantForm()
    await fillVariantId(variant.id)
    await fillVariantName(variant.name)
    await clickSubmitVariantButton()

    const anotherVariant: Variant = {
      name: 'C',
      id: '0987654321',
    }
    await clickOpenVariantForm()
    await fillVariantId(anotherVariant.id)
    await fillVariantName(anotherVariant.name)
    await clickSubmitVariantButton()

    const optionLabels = await tester.page.$$eval(optionSelector, (options) =>
      options.map(({ textContent }) => textContent)
    )
    expect(optionLabels.length).toBe(2)
    expect(optionLabels[0]).toBe('B (1234567890)')
    expect(optionLabels[1]).toBe('C (0987654321)')
  })

  test('hides form on second plus button click', async () => {
    await clickOpenVariantForm()
    expect(await tester.page.$(variantNameInputSelector)).toBeDefined()

    await clickOpenVariantForm()
    expect(await tester.page.$(variantNameInputSelector)).toBeNull()
  })
})
