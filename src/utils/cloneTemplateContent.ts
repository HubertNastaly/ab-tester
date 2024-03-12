export function cloneTemplateContent(templateId: string) {
  const template = document.getElementById(templateId) as HTMLTemplateElement | null
  if(!template) {
    throw new Error(`Cannot find template with id: ${templateId}`)
  }
  return template.content.cloneNode(true)
}
