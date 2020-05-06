import { AddContentPlugin } from 'tinacms'
import { getCachedFormData, setCachedFormData } from '../../formCache'
import { toMarkdownString } from 'next-tinacms-markdown'

const path = require('path')
const guidesRoot = 'content/guides'
export const GuideCreatorPlugin: AddContentPlugin<any> = {
  __type: 'content-creator',
  name: 'Guide',
  fields: [
    {
      name: 'title',
      label: 'Title',
      component: 'text',
    },
    {
      name: 'slug',
      label: 'Slug',
      component: 'text',
    },
    {
      name: 'category',
      label: 'Category (type in slug; must already exist)',
      component: 'text',
    },
  ],
  async onSubmit(values, cms) {
    const guidePath = path.join(guidesRoot, values.category, values.slug)
    const guideMetaPath = path.join(guidePath, 'meta.json')
    const overviewPath = path.join(guidePath, 'overview.md')
    const metaResponse = await cms.api.github.commit(
      guideMetaPath,
      getCachedFormData(guideMetaPath).sha,
      JSON.stringify({
        title: values.title,
        steps: [
          {
            id: overviewPath,
            slug: overviewPath,
            title: 'Overview',
            data: './overview.md',
          },
        ],
      }),
      '[TinaCMS] guides: add new guide'
    )
    setCachedFormData(guideMetaPath, {
      sha: metaResponse.content.sha,
    })

    const stepResponse = await cms.api.github.commit(
      overviewPath,
      getCachedFormData(overviewPath).sha,
      toMarkdownString({
        fileRelativePath: overviewPath,
        frontmatter: { title: 'Overview' },
        markdownBody:
          '- What will the reader learn in this guide?\n- What should the reader have prepared before starting this guide?\n- Is there anything else the reader should know before starting?',
      }),
      '[TinaCMS] guides: add guide overview'
    )
    setCachedFormData(overviewPath, {
      sha: stepResponse.content.sha,
    })
    // @ts-ignore you're drunk
    cms.alerts.success(`Created guide: '${values.title}'`)
    window.location.href = `guides/${values.category}/${values.slug}/overview`
  },
}
