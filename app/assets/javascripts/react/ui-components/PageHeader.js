import React from 'react'
import cx from 'classnames'
import Link from './Link.cjsx'

const PageHeader = ({ icon, fa, title, actions, workflow }) => {
  const labelStyle = {
    backgroundColor: '#505050',
    color: '#fff',
    display: 'inline-block',
    borderRadius: '3px',
    position: 'relative',
    top: '-7px'
  }

  let workflowLabel = null
  if(workflow) {
    const workflowLink = <Link href={workflow.actions.edit.url} mods="strong">
      {workflow.name}
    </Link>
    workflowLabel = (
      <label style={labelStyle} className="phs mls">
        This {icon === 'set' ? 'Set' : 'Media Entry'} is part of the Workflow "{workflowLink}"
      </label>
    )
  }

  return <div className='ui-body-title'>
    <div className='ui-body-title-label'>
      <h1 className='title-xl'>
        {!!icon &&
          <span>
            <i className={'icon-' + icon} />{' '}
          </span>}
        {!!fa &&
          <span>
            <span className={cx('fa fa-share', 'title-xl')} />{' '}
          </span>}
        {title}
      </h1>
      {workflow && (workflowLabel)}
    </div>

    {!!actions &&
      <div className='ui-body-title-actions'>
        <span data="spacer-gif">{"\u00a0"}</span>
        {actions}
      </div>}
  </div>
}

PageHeader.propTypes = {
  title: React.PropTypes.string.isRequired,
  children: React.PropTypes.node,
  icon: React.PropTypes.string
}

module.exports = PageHeader
