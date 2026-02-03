import yaml from 'yaml'
import type { CompleteConfig } from '~/types'

export default defineEventHandler(async (event) => {
  const storage = useStorage('main')
  const config = await storage.getItem<CompleteConfig>('config')

  if (!config) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Bad loading config',
    })
  }

  // Convert services back to the original YAML format
  const exportConfig: Record<string, any> = {
    title: config.title,
    lang: config.lang,
    theme: config.theme,
    background: config.background,
    checkUpdates: config.checkUpdates,
    layout: config.layout,
    behaviour: config.behaviour,
    tags: config.tags,
  }

  // Convert services structure
  if (config.services.length === 1 && !config.services[0].title) {
    // Simple array format
    exportConfig.services = config.services[0].items.map(service => {
      const { id, ...rest } = service
      return {
        ...rest,
        tags: service.tags?.map(tag => typeof tag === 'string' ? tag : tag.name),
      }
    })
  } else {
    // Grouped format
    exportConfig.services = config.services.reduce((acc, group) => {
      const groupName = group.title || 'default'
      acc[groupName] = group.items.map(service => {
        const { id, ...rest } = service
        return {
          ...rest,
          tags: service.tags?.map(tag => typeof tag === 'string' ? tag : tag.name),
        }
      })
      return acc
    }, {} as Record<string, any>)
  }

  const yamlContent = yaml.stringify(exportConfig, {
    defaultStringType: 'QUOTE_DOUBLE',
    defaultKeyType: 'PLAIN',
  })

  setResponseHeaders(event, {
    'Content-Type': 'application/x-yaml',
    'Content-Disposition': 'attachment; filename="mafl-config.yml"',
  })

  return yamlContent
})
