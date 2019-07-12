// Collapsible Subsection, a wrapper around <details> element
import React from 'react'

const SubSection = ({ children, startOpen = true }) => {
  const content = React.Children.toArray(children).reduce(
    (res, child) => {
      if (child.type === SubSection.Title) res.titles.push(child)
      else res.rest.push(child)
      return res
    },
    { titles: [], rest: [] }
  )
  if (content.titles.length > 1) throw new Error('Given too many titles!')
  const title = content.titles[0]
  return (
    <details className="ui-subsection" open={startOpen}>
      {!!title && title}
      {content.rest}
    </details>
  )
}

const SubSectionTitle = ({ tag, ...props }) => {
  const Tag = tag
  return (
    <summary>
      <Tag {...props} style={{ display: 'inline-block', ...props.style }} />
    </summary>
  )
}
SubSectionTitle.displayName = 'SubSection.Title'

SubSection.Title = SubSectionTitle

export default SubSection
