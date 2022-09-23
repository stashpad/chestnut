import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import { compile } from 'handlebars'

export default async (): Promise<HandlebarsTemplateDelegate> => {
  const viewPath = path.normalize(path.join(__dirname, '../../views/index.hbs'))
  const viewContent = await promisify(fs.readFile)(viewPath, 'utf8')

  return compile(viewContent)
}
