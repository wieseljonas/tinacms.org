import { AddContentPlugin } from 'tinacms'
import { getCachedFormData, setCachedFormData } from '../../formCache'

const path = require('path')
const categoryRootPath = 'content/guides'
export const CategoryCreatorPlugin: AddContentPlugin<any> = {
  __type: 'content-creator',
  name: 'Category',
  fields: [
    {
      name: 'title',
      label: 'Category Title',
      component: 'text',
    },
    {
      name: 'slug',
      label: 'Slug',
      component: 'text',
    },
  ],
  async onSubmit(values, cms) {
    const categoryPath = path.join(categoryRootPath, values.slug, 'meta.json')
    const response = await cms.api.github.commit(
      categoryPath,
      getCachedFormData(categoryPath).sha,
      JSON.stringify({
        title: values.title,
      }),
      'Update from TinaCMS: Add Guide Category'
    )
    setCachedFormData(categoryPath, {
      sha: response.content.sha,
    })
    // @ts-ignore you're drunk
    cms.alerts.success(`Created category: '${values.title}'`)
  },
}
