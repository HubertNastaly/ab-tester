import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { SELECTORS, Tester } from '../utils'
import { EXPERIMENTS_MOCK } from '../mocks'

describe('activate experiment', () => {
  let tester: Tester

  const clickActivateButton = async (experimentName: string) =>
    tester.waitForAndClick(SELECTORS.activateButton(experimentName))
  const getActivateButtonText = async (experimentName: string) =>
    tester.getTextContent(SELECTORS.activateButton(experimentName))
  const isActivateButtonDisabled = async (experimentName: string) =>
    tester.isButtonDisabled(SELECTORS.activateButton(experimentName))

  beforeEach(async () => {
    tester = await Tester.create()
    await tester.addExperiments(EXPERIMENTS_MOCK)
  })

  afterEach(async () => {
    await tester.close()
  })

  describe('activate', () => {
    test('disabled if no variant available', async () => {
      expect(await isActivateButtonDisabled('EX-107')).toBe(true)
    })

    test('enabled if variant available', async () => {
      expect(await isActivateButtonDisabled('EX-123')).toBe(false)
    })

    test('changes label on activate', async () => {
      await clickActivateButton('EX-123')
      expect(await getActivateButtonText('EX-123')).toBe('Active')
    })

    test('changes label on deactivate', async () => {
      await clickActivateButton('EX-123')
      expect(await getActivateButtonText('EX-123')).toBe('Active')

      await clickActivateButton('EX-123')
      expect(await getActivateButtonText('EX-123')).toBe('Activate')
    })

    test('deactivates other experiment', async () => {
      await clickActivateButton('EX-123')
      expect(await getActivateButtonText('EX-123')).toBe('Active')

      await clickActivateButton('EX-184')
      expect(await getActivateButtonText('EX-184')).toBe('Active')
      expect(await getActivateButtonText('EX-123')).toBe('Activate')
    })
  })
})
