import React from 'react'
import f from 'active-lodash'
import t from '../../../lib/i18n-translate'
import cx from 'classnames'

import MetaDataByListing from '../../decorators/MetaDataByListing.cjsx'
import ResourceThumbnail from '../../decorators/ResourceThumbnail.cjsx'
import Renderer from '../../decorators/metadataedit/MetadataEditRenderer.cjsx'
import Link from '../../ui-components/Link.cjsx'
import RailsForm from '../../lib/forms/rails-form.cjsx'
import validation from '../../../lib/metadata-edit-validation.coffee'

class WorkflowPreview extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      models: {},
      errors: {},
      isFinishing: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleValueChange = this.handleValueChange.bind(this)
  }

  handleSubmit(e) {
    this.setState({isFinishing: true})
  }

  componentWillMount() {
    const { child_resources } = this.props.get
    const { errors, models } = this.state

    f.each(child_resources, (childResource) => {
      const {
        meta_data: { meta_datum_by_meta_key_id },
        uuid: resourceId,
        meta_meta_data: { meta_key_by_meta_key_id }
      } = childResource

      errors[resourceId] = []

      f.each(meta_key_by_meta_key_id, (meta_key, metaKeyId) => {
        const model = {
          meta_key: meta_key,
          values: meta_datum_by_meta_key_id[metaKeyId].values || []
        }
        model.originalValues = model.values

        f.set(models, [resourceId, metaKeyId], model)

        const validationModel = {
          [metaKeyId]: f.get(models, [resourceId, metaKeyId])
        }
        if (validation._validityForAll(childResource.meta_meta_data, validationModel) === 'invalid') {
          errors[resourceId].push(metaKeyId)
        }

        this.setState({ models, errors })
      })
    })
  }

  handleValueChange(values, metaKeyId, childResource) {
    const { errors, models } = this.state
    const { uuid: resourceId, meta_meta_data } = childResource

    f.set(models, [resourceId, metaKeyId, 'values'], values)

    if (
      f.has(errors, resourceId)
      && f.isArray(errors[resourceId])
      && f.includes(errors[resourceId], metaKeyId)
    ) {
      f.remove(errors[resourceId], (x) => x === metaKeyId)
    }

    const validationModel = {
      [metaKeyId]: f.get(models, [resourceId, metaKeyId])
    }
    if (validation._validityForAll(meta_meta_data, validationModel) === 'invalid') {
      errors[resourceId].push(metaKeyId)
    }

    this.setState({ models, errors })
  }

  // validate(metaMetaData, resourceId, metaKeyId) {
  //   const validationModel = {
  //     [meta_key_id]: f.get(models, [resourceId, meta_key_id])
  //   }

  //   if (validation._validityForAll(metaMetaData, validationModel) === 'invalid') {
  //     errors[resourceId].push(meta_key_id)
  //   }
  // }

  hasErrors() {
    return !f.every(f.values(this.state.errors), (arr) => f.isEmpty(arr))
  }

  render() {
    const { get, authToken } = this.props
    const { models, errors, isFinishing } = this.state
    const supHeadStyle = { textTransform: 'uppercase', fontSize: '85%', letterSpacing: '0.15em' }
    const submitBtnClass = cx('button primary-button large', { disabled: isFinishing })

    return (
      <section className="ui-container bright bordered rounded mas pam">
        <header>
          <span style={supHeadStyle}>{'Workflow'}</span>
        </header>
        {/*<Link href={get.actions.edit.url}>&larr; Go back to workflow</Link>*/}

        <RailsForm
          ref='form'
          name='resource_meta_data'
          action={get.actions.finish.url}
          method={get.actions.finish.method}
          authToken={authToken}
        >

          {f.map(get.child_resources, (childResource, i) => {
            const {
              resource,
              type,
              meta_meta_data: { meta_key_by_meta_key_id },
              uuid: resourceId
            } = childResource

            return (
              <div className='ui-container bordered pal mbs' key={i}>
                <span style={supHeadStyle}>{type}</span>
                <div className='app-body-sidebar table-cell ui-container table-side prm'>
                  {Renderer._renderThumbnail(resource, false)}
                </div>
                <div className='app-body-content table-cell ui-container table-substance ui-container'>
                  {
                    f.map(meta_key_by_meta_key_id, (metaKey, metaKeyId) => {
                      const hasError = f.include(errors[resourceId], metaKeyId)
                      const model = f.get(models, [resourceId, metaKeyId])

                      return (
                        <Fieldset
                          childResource={childResource}
                          metaKey={metaKey}
                          hasError={hasError}
                          model={model}
                          handleValueChange={this.handleValueChange}
                          key={metaKeyId}
                        />
                      )
                    })
                  }
                </div>
              </div>
            )
          })}

          <div className='ui-actions pts pbs'>
            <a className='link weak' href={get.actions.edit.url}>
              {'Go back'}
            </a>
            <button type='submit' className={submitBtnClass} disabled={this.hasErrors()} onClick={this.handleSubmit}>
              {isFinishing ? 'Finishing…' : 'Finish'}
            </button>
          </div>

        </RailsForm>
      </section>
    )
  }
}

module.exports = WorkflowPreview

class Fieldset extends React.PureComponent {
  render() {
    const { childResource, metaKey, model, hasError, handleValueChange } = this.props
    const {
      meta_data: { meta_datum_by_meta_key_id },
      meta_meta_data,
      meta_meta_data: { mandatory_by_meta_key_id },
      uuid: resourceId,
      type,
      workflow
    } = childResource
    const { uuid: metaKeyId } = metaKey

    if (f.isEmpty(meta_datum_by_meta_key_id[metaKeyId].values) && !f.has(mandatory_by_meta_key_id, metaKeyId) && !f.includes(f.map(workflow.common_settings.meta_data, 'meta_key.uuid'), metaKeyId)) {
      return null
    }

    const cssClass = cx('ui-form-group prh columned', {'error': hasError})
    const fieldName = `meta_data[${type}][${resourceId}]`

    return (
      <fieldset className={cssClass}>
        {Renderer._renderLabelByVocabularies(meta_meta_data, metaKeyId)}
        {Renderer._renderValueByContext((values) => handleValueChange(values, metaKeyId, childResource), fieldName, null, metaKey, false, model, workflow)}
      </fieldset>
    )
  }
}
