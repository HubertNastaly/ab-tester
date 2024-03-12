import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { SELECTORS, Tester } from '../utils'
import { Experiment, Variant } from '../../types'

const EXPERIMENTS_MOCK: Experiment[] = [
  {
    name: 'EX-107',
    variants: []
  },
  {
    name: 'EX-123',
    variants: [
      { name: 'B', id: '1234567890' },
      { name: 'C', id: '0987654321' }
    ]
  },
  {
    name: 'EX-184',
    variants: [
      { name: 'B', id: '1234509876' }
    ]
  }
]

describe('activate experiment', () => {
  let tester: Tester

  async function mockVariant(experimentName: string, { id, name }: Variant) {
    await tester.waitForAndClick(SELECTORS.addVariantButton(experimentName))
    await tester.waitForAndFill(SELECTORS.variantNameInput(experimentName), name)
    await tester.waitForAndFill(SELECTORS.variantIdInput(experimentName), id)

    await tester.waitForAndClick(SELECTORS.submitVariantButton(experimentName))
  }

  async function mockExperiments() {
    for(let i=0; i<EXPERIMENTS_MOCK.length; i++) {
      const { name: experimentName, variants } = EXPERIMENTS_MOCK[i]
      await tester.waitForAndFill(SELECTORS.addExperimentInput, experimentName);
      await tester.waitForEnabled(SELECTORS.addExperimentButton)
      await tester.click(SELECTORS.addExperimentButton)

      for(const variant of variants) {
        await mockVariant(experimentName, variant)
      }
    }
  }

  beforeEach(async () => {
    tester = await Tester.create()
    await mockExperiments()
  })

  afterEach(async () => {
    await tester.close()
  })

  describe('activate', () => {
    test('disabled if no variant available', async () => {
      expect(await tester.isButtonDisabled(SELECTORS.activateButton('EX-107'))).toBe(true)
    })

    test('enabled if variant available', async () => {
      expect(await tester.isButtonDisabled(SELECTORS.activateButton('EX-123'))).toBe(false)
    })

    test('changes label on activate', async () => {
      await tester.waitForAndClick(SELECTORS.activateButton('EX-123'))
      expect(await tester.getTextContent(SELECTORS.activateButton('EX-123'))).toBe('Active')
    })

    test('changes label on deactivate', async () => {
      await tester.waitForAndClick(SELECTORS.activateButton('EX-123'))
      expect(await tester.getTextContent(SELECTORS.activateButton('EX-123'))).toBe('Active')

      await tester.waitForAndClick(SELECTORS.activateButton('EX-123'))
      expect(await tester.getTextContent(SELECTORS.activateButton('EX-123'))).toBe('Activate')
    })

    test('deactivates other experiment', async () => {
      await tester.waitForAndClick(SELECTORS.activateButton('EX-123'))
      expect(await tester.getTextContent(SELECTORS.activateButton('EX-123'))).toBe('Active')

      await tester.waitForAndClick(SELECTORS.activateButton('EX-184'))
      expect(await tester.getTextContent(SELECTORS.activateButton('EX-184'))).toBe('Active')
      expect(await tester.getTextContent(SELECTORS.activateButton('EX-123'))).toBe('Activate')
    })
  })
})
