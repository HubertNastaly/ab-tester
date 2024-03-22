export const createSelectOption = (
  value: string,
  label: string
): HTMLOptionElement => {
  const option = document.createElement('option')
  option.value = value
  option.innerHTML = label
  return option
}
