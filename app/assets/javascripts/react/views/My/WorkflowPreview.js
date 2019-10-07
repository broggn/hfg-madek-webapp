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
  }

  handleSubmit(e) {
    this.setState({isFinishing: true})
    true
  }

  componentWillMount() {
    console.log('props', this.props)
    const { child_resources } = this.props.get
    const { errors, models } = this.state

    f.each(child_resources, (childResource) => {
      const { resource, meta_data } = childResource

      f.each(childResource.meta_meta_data.meta_key_by_meta_key_id, (meta_key, meta_key_id) => {
        const model = {
          meta_key: meta_key,
          values: meta_data.meta_datum_by_meta_key_id[meta_key_id].values || []
        }
        model.originalValues = model.values

        f.set(models, [resource.uuid, meta_key_id], model)

        const validationModel = {}
        validationModel[meta_key_id] = f.get(models, [resource.uuid, meta_key_id])
        if(validation._validityForAll(childResource.meta_meta_data, validationModel) === 'invalid') {
          if(!f.has(errors, resource.uuid)) {
            f.set(errors, resource.uuid, [])
          }
          errors[resource.uuid].push(meta_key_id)
        }

        this.setState({ models, errors })
      })
    })
  }

  handleValueChange(values, meta_key_id, childResource) {
    const { errors, models } = this.state
    const resource_id = childResource.resource.uuid
    f.set(models, [resource_id, meta_key_id, 'values'], values)

    const validationModel = {}
    validationModel[meta_key_id] = f.get(models, [resource_id, meta_key_id])
    // console.log(validationModel)

    // console.log(validation._validityForAll(childResource.meta_meta_data, validationModel))

    if(f.has(errors, resource_id) && f.isArray(errors[resource_id]) && f.includes(errors[resource_id], meta_key_id)) {
      f.remove(errors[resource_id], (x) => x === meta_key_id)
      if(f.isEmpty(errors[resource_id])) {
        delete errors[resource_id]
      }
    }

    if(validation._validityForAll(childResource.meta_meta_data, validationModel) === 'invalid') {
      if(!f.has(errors, resource_id)) {
        f.set(errors, resource_id, [])
      }
      errors[resource_id].push(meta_key_id)
    }

    // console.log('errors', errors)

    this.setState({ models, errors })
  }

  render() {
    const { get } = this.props
    const supHeadStyle = { textTransform: 'uppercase', fontSize: '85%', letterSpacing: '0.15em' }
    const submitBtnClass = cx('button primary-button large', { disabled: this.state.isFinishing })

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
          authToken={this.props.authToken}
        >

          {get.child_resources.map((childResource, i) => {
            // console.log('childResource', childResource)
            const { meta_data, meta_meta_data, workflow, resource, type } = childResource
            const { meta_key_by_meta_key_id, mandatory_by_meta_key_id } = meta_meta_data

            return (
              <div className='ui-container bordered pal mbs' key={i}>
                <span style={supHeadStyle}>{type}</span>
                <div className='app-body-sidebar table-cell ui-container table-side prm'>
                  {Renderer._renderThumbnail(resource, false)}
                </div>
                <div className='app-body-content table-cell ui-container table-substance ui-container'>
                  {f.map(meta_key_by_meta_key_id, (meta_key, meta_key_id) => {
                    if(f.isEmpty(meta_data.meta_datum_by_meta_key_id[meta_key_id].values) && !f.has(mandatory_by_meta_key_id, meta_key_id) && !f.includes(f.map(workflow.common_settings.meta_data, 'meta_key.uuid'), meta_key_id)) {
                      return null
                    }

                    const model = f.get(this.state.models, [resource.uuid, meta_key_id])
                    const hasError = f.has(this.state.errors, resource.uuid) && f.isArray(this.state.errors[resource.uuid]) && f.includes(this.state.errors[resource.uuid], meta_key_id)
                    console.log('hasError', hasError)
                    const cssClass = cx('ui-form-group prh columned', {'error': f.has(mandatory_by_meta_key_id, meta_key_id) && hasError})
                    const fieldName = `meta_data[${type}][${resource.uuid}]`

                    return (
                      <fieldset className={cssClass} key={meta_key_id}>
                        {Renderer._renderLabelByVocabularies(meta_meta_data, meta_key_id)}
                        {Renderer._renderValueByContext((values) => this.handleValueChange(values, meta_key_id, childResource), fieldName, null, meta_key, false, model, workflow)}
                      </fieldset>
                    )
                  }
                  )}
                </div>

              </div>
            )
          })}

          <div className='ui-actions pts pbs'>
            <a className='link weak' href={get.actions.edit.url}>
              {'Go back'}
            </a>
            <button type='submit' className={submitBtnClass} disabled={!f.isEmpty(this.state.errors)} onClick={this.handleSubmit}>
              {this.state.isFinishing ? 'Finishing…' : 'Finish'}
            </button>
          </div>

        </RailsForm>
      </section>
    )
  }
}

module.exports = WorkflowPreview
