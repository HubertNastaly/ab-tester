import puppeteer, { Browser, Page } from 'puppeteer-core'
import { assert } from 'vitest'
import { Experiment, Variant } from '../types'

const CHROME_LOCATION =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const EXTENSION_PATH = './dist'
const EXTENSION_ID = 'nammhgekcgoghpamiameegkldbffdalg'
const EXTENSION_POPUP_PATH = `chrome-extension://${EXTENSION_ID}/index.html`

const withinExperiment = (experimentName: string, selector: string) =>
  `[experiment-name="${experimentName}"] ${selector}`
const enabled = (selector: string) => `${selector}:not([disabled])`

export const SELECTORS = {
  addExperimentInput: '[data-testid="experiment-name"] input',
  addExperimentButton: '[data-testid="experiment-name"] button',
  addVariantButton: (experimentName: string) =>
    withinExperiment(experimentName, 'button.addVariant'),
  removeExperimentButton: (experimentName: string) =>
    withinExperiment(experimentName, 'button.removeExperiment'),
  submitVariantButton: (experimentName: string) =>
    withinExperiment(experimentName, 'add-variant button'),
  activateButton: (experimentName: string) =>
    withinExperiment(experimentName, '.activate'),
  variantSelect: (experimentName: string) =>
    withinExperiment(experimentName, 'select.experimentVariant'),
  variantIdInput: (experimentName: string) =>
    `[experiment-name="${experimentName}"] [name="variant-id"] input`,
  variantNameInput: (experimentName: string) =>
    `[experiment-name="${experimentName}"] [name="variant-name"] input`,
  withinExperiment,
}

export class Tester {
  public browser: Browser
  public page: Page

  constructor(_browser: Browser, _page: Page) {
    this.browser = _browser
    this.page = _page
  }

  private static async setupBrowser(): Promise<Browser> {
    return puppeteer.launch({
      executablePath: CHROME_LOCATION,
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    })
  }

  public static async create(): Promise<Tester> {
    const _browser = await this.setupBrowser()
    const _page = await _browser.newPage()
    await _page.setCacheEnabled(false)
    await _page.goto(EXTENSION_POPUP_PATH)

    return new Tester(_browser, _page)
  }

  public async close() {
    await this.page.close()
    await this.browser.close()
  }

  public async getByText(text: string, containerSelector = '') {
    const element = await this.page.$(
      `${containerSelector} *::-p-text(${text})`
    )
    assert(element, `No element with text: ${text}`)
    return element
  }

  public async waitForAndClick(selector: string) {
    const element = await this.waitForSelector(selector)
    await element.click()
  }

  public async click(selector: string) {
    return this.page.click(selector)
  }

  public async waitForAndFill(inputSelector: string, text: string) {
    await this.waitForAndClick(inputSelector)
    await this.page.keyboard.type(text)
  }

  public async getInputValue(inputSelector: string) {
    return this.page.$eval(
      inputSelector,
      (input) => (input as HTMLInputElement).value
    )
  }

  public async isButtonDisabled(buttonSelector: string) {
    return this.page.$eval(
      buttonSelector,
      (button) => (button as HTMLButtonElement).disabled
    )
  }

  public async getTextContent(selector: string) {
    const element = await this.waitForSelector(selector)
    return element.evaluate((element) => element.textContent)
  }

  public async waitForSelector(selector: string) {
    const element = await this.page.waitForSelector(selector, { timeout: 500 })
    assert(element, `Not found element by selector: ${selector}`)
    return element
  }

  public async waitForEnabled(selector: string) {
    return this.waitForSelector(enabled(selector))
  }

  private async addVariant(experimentName: string, { id, name }: Variant) {
    await this.waitForAndClick(SELECTORS.addVariantButton(experimentName))
    await this.waitForAndFill(SELECTORS.variantNameInput(experimentName), name)
    await this.waitForAndFill(SELECTORS.variantIdInput(experimentName), id)

    await this.waitForAndClick(SELECTORS.submitVariantButton(experimentName))
  }

  public async addExperiments(experiments: Experiment[]) {
    for (let i = 0; i < experiments.length; i++) {
      const { name: experimentName, variants } = experiments[i]
      await this.waitForAndFill(SELECTORS.addExperimentInput, experimentName)
      await this.waitForEnabled(SELECTORS.addExperimentButton)
      await this.click(SELECTORS.addExperimentButton)

      for (const variant of variants) {
        await this.addVariant(experimentName, variant)
      }
    }
  }
}
