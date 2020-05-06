import { AddContentPlugin } from 'tinacms'
import { getCachedFormData, setCachedFormData } from '../../formCache'
import { toMarkdownString } from 'next-tinacms-markdown'

export class GuideStepCreatorPlugin implements AddContentPlugin<any> {
  private category
  private guide
  private guideMeta

  __type: 'content-creator' = 'content-creator'
  name = 'Guide Step'
  fields = [
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
  ]

  constructor(category: string, guide: string, guideMeta: any) {
    this.category = category
    this.guide = guide
    this.guideMeta = guideMeta
  }

  async onSubmit(values, cms) {
    // create guide step
    const stepPath = `content/guides/${this.category}/${this.guide}/${values.slug}.md`
    const stepResponse = await cms.api.github.commit(
      stepPath,
      getCachedFormData(stepPath).sha,
      toMarkdownString({
        fileRelativePath: stepPath,
        frontmatter: { title: values.title },
        markdownBody:
          '- Consider a brief recap of the previous step: "Now that we\'ve ..."\n- Give the reader a sense of what we\'ll be doing in this step\n- Keep morale and momentum surging!',
      }),
      '[TinaCMS] guides: add guide step'
    )
    setCachedFormData(stepPath, {
      sha: stepResponse.content.sha,
    })

    // update guide meta
    const guideMetaPath = `content/guides/${this.category}/${this.guide}/meta.json`
    const stepUrl = `/guides/${this.category}/${this.guide}/${values.slug}`
    this.guideMeta.steps.push({
      id: stepUrl,
      slug: stepUrl,
      title: values.title,
      data: `./${values.slug}.md`,
    })
    const guideMetaResponse = cms.api.github.commit(
      guideMetaPath,
      getCachedFormData(guideMetaPath).sha,
      JSON.stringify(this.guideMeta),
      '[TinaCMS] guides: update guide step navigation'
    )

    // redirect to guide
    window.location.href = stepUrl
  }
}
