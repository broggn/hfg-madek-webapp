import React from 'react'
import f from 'active-lodash'

// import setUrlParams from '../../../lib/set-params-for-url.coffee'
// import AppRequest from '../../../lib/app-request.coffee'
// import asyncWhile from 'async/whilst'
// import { parse as parseUrl } from 'url'
// import { parse as parseQuery } from 'qs'
// import Moment from 'moment'
// import currentLocale from '../../../lib/current-locale'
const UI = require('../../ui-components/index.coffee')
import SubSection from '../../ui-components/SubSection'
import ResourceThumbnail from '../../decorators/ResourceThumbnail.cjsx'
import InputMetaDatum from '../../decorators/InputMetaDatum.cjsx'
import RailsForm from '../../lib/forms/rails-form.cjsx'
import appRequest from '../../../lib/app-request.coffee'
// import ui from '../../lib/ui.coffee'
// const t = ui.t
import I18nTranslate from '../../../lib/i18n-translate'
let AutoComplete = false // client-side only!

// const fakeCallback = (a, b, c) => console.log([a, b, c]) // eslint-disable-line
const DEBUG_STATE = false // set to true when developing or debugging forms with state!

// TODO: move to translations.csv
const UI_TXT = {
  feature_title: { de: 'Prozess', en: 'Workflow' },

  associated_collections_title: { de: 'Set mit Inhalten', en: 'Set with content' },
  associated_collections_explain: {
    de: `In diesem Set enthaltene Inhalte können vor dem Abschluss nur als Teil dieses Prozesses bearbeitet werden.`,
    en: `Content contained in this set may only be considered as part of this workflow prior to completion to be edited.`
  },
  associated_collections_upload: { de: 'Medien hinzufügen', en: 'Add media' },

  workflow_owners_title: { de: 'Prozess-Besitzer', en: 'Workflow owners' },

  common_settings_title: { de: 'Gemeinsamer Datensatz', en: 'Common data' },
  common_settings_explain: {
    de: `Diese Daten und Einstellungen gelten für alle enthaltenen Inhalte und werden bei
     Prozessabschluss permanent angewendet.`,
    en: `These data and settings apply to all contents and are permanently applied at the end of the process.`
  },
  common_settings_permissions_title: { de: 'Berechtigungen', en: 'Permissions' },
  common_settings_permissions_responsible: { de: 'Verantwortlich', en: 'Responsible' },
  common_settings_permissions_write: { de: 'Schreib- und Leserechte', en: 'Read and write rights' },
  common_settings_permissions_read: { de: 'Nur Leserechte', en: 'Only reading rights' },
  common_settings_permissions_read_public: { de: 'Öffentlicher Zugriff', en: 'Public access' },
  common_settings_metadata_title: { de: 'MetaDaten', en: 'MetaData' },

  actions_back: { de: 'Zurück', en: 'Go back' },
  actions_validate: { de: 'Prüfen', en: 'Check' },
  actions_finish: { de: 'Abschliessen…', en: 'Finish…' },

  add_md_by_metakey: { de: 'Hinzufügen', en: 'Add' },
  adder_meta_key_already_used: { de: 'Metakey ist schon verwendet', en: 'Metakey already used' }
}

const t = key => {
  /* global APP_CONFIG */
  // FIXME: only works client-side for now, hardcode a fallback…
  const locale = f.get(APP_CONFIG, 'userLanguage') || 'de'
  return f.get(UI_TXT, [key, locale]) || I18nTranslate(key)
}

const WORKFLOW_STATES = { IN_PROGRESS: 'IN_PROGRESS', FINISHED: 'FINISHED' }

class WorkflowEdit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isEditingPermissions: false,
      isSavingPermissions: false,
      permissionsUpdateError: null,
      isEditingMetadata: false,
      isSavingMetadata: false,
      metaDataUpdateError: null,
      commonPermissions: props.get.common_settings.permissions,
      commonMetadata: props.get.common_settings.meta_data
    }

    this.actions = [
      'onToggleEditPermissions',
      'onSavePermissions',
      'onToggleEditMetadata',
      'onSaveMetadata'
    ].reduce((o, name) => ({ ...o, [name]: this[name].bind(this) }), {})
  }

  onToggleEditPermissions(event) {
    event.preventDefault()
    // NOTE: Date instead of "true" because it's used as React-`key` for the "edit session",
    // this is done to enforce a freshly mounted component every time,
    // which is needed because we read props into state!
    this.setState(cur => ({ isEditingPermissions: cur.isEditingPermissions ? false : Date.now() }))
  }
  onSavePermissions(commonPermissions) {
    const action = f.get(this, 'props.get.actions.update')
    if (!action) throw new Error()
    const finalState = { isSavingPermissions: false, isEditingPermissions: false }
    this.setState({ isSavingPermissions: true })

    // tranform form data into what is sent to server:
    const body = {
      workflow: {
        common_permissions: {
          read: f.map(commonPermissions.read, 'uuid'),
          write: f.map(commonPermissions.write, 'uuid'),
          read_public: commonPermissions.read_public
        }
      }
    }

    appRequest({ url: action.url, method: action.method, json: body }, (err, res) => {
      if (err) {
        console.error(err) // eslint-disable-line no-console
        alert('ERROR! ' + JSON.stringify(err))
        return this.setState({ ...finalState, permissionsUpdateError: err })
      }
      console.log({ res }) // eslint-disable-line no-console
      const commonPermissions = f.get(res, 'body.common_settings.permissions')
      this.setState({ ...finalState, commonPermissions })
    })
  }

  onToggleEditMetadata(event) {
    event.preventDefault()
    this.setState(cur => ({ isEditingMetadata: cur.isEditingMetadata ? false : Date.now() }))
  }
  onSaveMetadata(commonMetadata) {
    const action = f.get(this, 'props.get.actions.update')
    if (!action) throw new Error()
    const finalState = { isSavingMetadata: false, isEditingMetadata: false }
    this.setState({ isSavingMetadata: true })

    // tranform form data into what is sent to server:
    const body = {
      workflow: {
        common_metadata: f.map(commonMetadata, md => ({
          meta_key_id: md.meta_key.uuid,
          value: md.value
        }))
      }
    }

    appRequest({ url: action.url, method: action.method, json: body }, (err, res) => {
      if (err) {
        console.error(err) // eslint-disable-line no-console
        alert('ERROR! ' + JSON.stringify(err))
        return this.setState({ finalState, metaDataUpdateError: err })
      }
      console.log({ res }) // eslint-disable-line no-console
      const commonMetadata = f.get(res, 'body.common_settings.meta_data')
      this.setState({ ...finalState, commonMetadata })
    })
  }

  render({ props, state, actions } = this) {
    const { name, status, workflow_owners } = props.get

    return (
      <div>
        <WorkflowEditor
          {...{ name, status, workflow_owners, authToken: props.authToken, get: props.get }}
          {...state}
          {...actions}
        />
        {!!DEBUG_STATE && <ShowJSONData data={{ state, props }} />}
      </div>
    )
  }
}

const WorkflowEditor = ({
  name,
  status,
  workflow_owners,
  authToken,

  get, // FIXME: remove this, replace with named props

  commonPermissions,
  onToggleEditPermissions,
  isEditingPermissions,
  isSavingPermissions,
  onSavePermissions,

  commonMetadata,
  onToggleEditMetadata,
  isEditingMetadata,
  isSavingMetadata,
  onSaveMetadata
}) => {
  const supHeadStyle = { textTransform: 'uppercase', fontSize: '85%', letterSpacing: '0.15em' }
  const headStyle = { lineHeight: '1.34' }

  return (
    <section className="ui-container bright bordered rounded mas pam">
      <header>
        <span style={supHeadStyle}>{t('feature_title')}</span>
        <h1 className="title-l" style={headStyle}>
          {name}
        </h1>
      </header>

      <div>
        <SubSection>
          <SubSection.Title tag="h2" className="title-m mts">
            {t('associated_collections_title')}
          </SubSection.Title>

          <Explainer>{t('associated_collections_explain')}</Explainer>

          <div>
            <div className="ui-resources miniature" style={{ margin: 0 }}>
              {f.map(get.associated_collections, (collection, i) => (
                <ResourceThumbnail get={collection} key={i} />
              ))}
            </div>

            <div className="button-group small mas">
              <a className="tertiary-button" href={get.actions.upload.url}>
                <span>
                  <i className="icon-upload"></i>
                </span>{' '}
                {t('associated_collections_upload')}
              </a>
            </div>
          </div>
        </SubSection>

        <SubSection>
          <SubSection.Title tag="h2" className="title-m mts">
            {t('workflow_owners_title')}
          </SubSection.Title>

          <UI.TagCloud mod="person" mods="small" list={labelize(workflow_owners)} />
        </SubSection>

        <SubSection>
          <SubSection.Title tag="h2" className="title-m mts">
            {t('common_settings_title')}
          </SubSection.Title>

          <Explainer>{t('common_settings_explain')}</Explainer>

          <h3 className="title-s mts">
            {t('common_settings_permissions_title')}
            {'  '}
            {!isEditingPermissions && <EditButton onClick={onToggleEditPermissions} />}
          </h3>

          {isEditingPermissions ? (
            <PermissionsEditor
              key={isEditingPermissions}
              commonPermissions={commonPermissions}
              isSaving={isSavingPermissions}
              onCancel={onToggleEditPermissions}
              onSave={onSavePermissions}
            />
          ) : (
            <ul>
              <li>
                <span className="title-s">{t('common_settings_permissions_responsible')}: </span>
                {!!commonPermissions.responsible && (
                  <UI.TagCloud
                    mod="person"
                    mods="small inline"
                    list={labelize([commonPermissions.responsible])}
                  />
                )}
              </li>
              <li>
                <span className="title-s">
                  {t('common_settings_permissions_write')}
                  {': '}
                </span>
                <UI.TagCloud
                  mod="person"
                  mods="small inline"
                  list={labelize(commonPermissions.write)}
                />
              </li>
              <li>
                <span className="title-s">
                  {t('common_settings_permissions_read')}
                  {': '}
                </span>
                <UI.TagCloud
                  mod="person"
                  mods="small inline"
                  list={labelize(commonPermissions.read)}
                />
              </li>
              <li>
                <span className="title-s">
                  {t('common_settings_permissions_read_public')}
                  {': '}
                </span>
                {commonPermissions.read_public ? (
                  <i className="icon-checkmark" title="Ja" />
                ) : (
                  <i className="icon-close" title="Nein" />
                )}
              </li>
            </ul>
          )}

          <h3 className="title-s mts">
            {t('common_settings_metadata_title')}
            {'  '}
            {!isEditingPermissions && <EditButton onClick={onToggleEditMetadata} />}
          </h3>

          {isEditingMetadata ? (
            <MetadataEditor
              key={isEditingMetadata}
              commonMetadata={commonMetadata}
              isSaving={isSavingMetadata}
              onCancel={onToggleEditMetadata}
              onSave={onSaveMetadata}
            />
          ) : (
            <ul>
              {commonMetadata.map(({ meta_key, value }) => (
                <li key={meta_key.uuid}>
                  <b>{meta_key.label}:</b> {value}
                </li>
              ))}
            </ul>
          )}
        </SubSection>
      </div>

      <div className="ui-actions phl pbl mtl">
        <a className="link weak" href={get.actions.index.url}>
          {t('actions_back')}
        </a>
        {/*
        <button className="tertiary-button large" type="button">
          {t('actions_validate')}
        </button>
        */}
        {status === WORKFLOW_STATES.IN_PROGRESS && (
          <RailsForm
            action={get.actions.finish.url}
            method={get.actions.finish.method}
            name="workflow"
            style={{ display: 'inline-block' }}
            authToken={authToken}>
            {' '}
            <button className="primary-button large" type="submit">
              {t('actions_finish')}
            </button>
          </RailsForm>
        )}
      </div>
    </section>
  )
}

module.exports = WorkflowEdit

class MetadataEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = { md: this.props.commonMetadata }
    AutoComplete = AutoComplete || require('../../lib/autocomplete.cjsx')
    this.onChangeMdValue = this.onChangeMdValue.bind(this)
    this.onAddMdByMk = this.onAddMdByMk.bind(this)
    this.onRemoveMd = this.onRemoveMd.bind(this)
  }

  onChangeMdValue(name, value) {
    // change value in metadata list where `name` of input matches MetaKey `id`
    this.setState(cur => ({
      md: cur.md.map(md => (md.meta_key.uuid !== name ? md : { ...md, value: f.compact(value) }))
    }))
  }
  onAddMdByMk(mk) {
    // add to metadata list for the MetaKey provided by the automcomplete/searcher.
    const alreadyExists = f.any(this.state.md, md => f.get(mk, 'uuid') === md.meta_key.uuid)
    if (alreadyExists) return false
    // debugger // eslint-disable-line no-debugger
    this.setState(cur => ({ md: cur.md.concat([{ meta_key: mk }]) }))
  }
  onRemoveMd(md) {
    // remove from metadata list the entry matching the mMetaKey `id`
    this.setState(cur => ({ md: cur.md.filter(curmd => curmd.meta_key.uuid !== md.meta_key.uuid) }))
  }

  render({ props, state } = this) {
    const { onSave, onCancel, isSaving } = props

    return (
      <div>
        {!!isSaving && <SaveBusySignal />}
        <form
          className={isSaving ? 'hidden' : null}
          onSubmit={e => {
            e.preventDefault()
            onSave(this.state.md)
          }}>
          <ul className="pvs">
            {state.md.map((md, i) => (
              <Let key={i} name={md.meta_key.uuid} inputId={`emk_${md.meta_key.uuid}`}>
                {({ name, inputId }) => (
                  <li className="ui-form-group pan pts columned">
                    <div className="form-label">
                      <label htmlFor={inputId}>{md.meta_key.label}</label>
                      <button
                        type="button"
                        className="button small db"
                        onClick={() => this.onRemoveMd(md)}>
                        DEL
                      </button>
                    </div>
                    <InputMetaDatum
                      id={inputId}
                      metaKey={md.meta_key}
                      // NOTE: with plural values this array around value should be removed
                      model={{ values: [md.value] }}
                      name={name}
                      onChange={val => this.onChangeMdValue(name, val)}
                    />
                  </li>
                )}
              </Let>
            ))}
          </ul>
          <div>
            {t('add_md_by_metakey')}
            <span style={{ position: 'relative' }}>
              <AutoComplete
                className="block"
                name="add-meta-key"
                resourceType="MetaKeys"
                searchParams={{}}
                onSelect={this.onAddMdByMk}
                existingValueHint={t('adder_meta_key_already_used')}
                valueFilter={val => f.any(state.md, md => f.get(val, 'uuid') === md.meta_key.uuid)}
              />
            </span>
          </div>

          <div className="pts pbs">
            <button type="submit" className="button primary-button">
              SAVE
            </button>{' '}
            <button type="button" className="button" onClick={onCancel}>
              CANCEL
            </button>
          </div>
        </form>
        {!!DEBUG_STATE && <ShowJSONData data={{ state, props }} />}
      </div>
    )
  }
}

class PermissionsEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = { ...this.props.commonPermissions }
    AutoComplete = AutoComplete || require('../../lib/autocomplete.cjsx')
    this.onSetResponsible = this.onSetResponsible.bind(this)
    this.onTogglePublicRead = this.onTogglePublicRead.bind(this)
    this.onAddPermissionEntity = this.onAddPermissionEntity.bind(this)
    this.onRemovePermissionEntity = this.onRemovePermissionEntity.bind(this)
  }

  onSetResponsible(obj) {
    this.setState({ responsible: obj })
  }

  onTogglePublicRead() {
    this.setState(cur => ({ read_public: !cur.read_public }))
  }

  onAddPermissionEntity(listKey, obj) {
    this.setState(cur => ({ [listKey]: cur[listKey].concat(obj) }))
  }

  onRemovePermissionEntity(listKey, obj) {
    this.setState(cur => ({ [listKey]: cur[listKey].filter(item => item.uuid !== obj.uuid) }))
  }

  render({ props, state } = this) {
    const { onSave, onCancel, isSaving } = props

    return (
      <div>
        {!!isSaving && <SaveBusySignal />}
        <form
          className={isSaving ? 'hidden' : null}
          onSubmit={e => {
            e.preventDefault()
            onSave(this.state)
          }}>
          <ul>
            <li>
              <span className="title-s">{t('common_settings_permissions_responsible')}: </span>
              <UI.TagCloud mod="person" mods="small inline" list={labelize([state.responsible])} />
              <div className="row">
                <div className="col1of3">
                  Nutzer auswählen:{' '}
                  <AutocompleteAdder
                    type="Users"
                    onSelect={this.onSetResponsible}
                    valueFilter={val => f.get(state.responsible, 'uuid') === f.get(val, 'uuid')}
                  />
                </div>
              </div>
            </li>
            <li>
              <span className="title-s">
                {t('common_settings_permissions_write')}
                {': '}
              </span>
              <UI.TagCloud
                mod="person"
                mods="small inline"
                list={labelize(state.write, {
                  onDelete: f.curry(this.onRemovePermissionEntity)('write')
                })}
              />
              <MultiAdder onAdd={f.curry(this.onAddPermissionEntity)('write')} />
            </li>
            <li>
              <span className="title-s">
                {t('common_settings_permissions_read')}
                {': '}
              </span>
              <UI.TagCloud mod="person" mods="small inline" list={labelize(state.read)} />
              <MultiAdder onAdd={f.curry(this.onAddPermissionEntity)('write')} />
            </li>
            <li>
              <span className="title-s">
                {t('common_settings_permissions_read_public')}
                {': '}
              </span>
              <input
                type="checkbox"
                checked={state.read_public}
                onChange={this.onTogglePublicRead}
              />
            </li>
          </ul>

          <div className="pts pbs">
            <button type="submit" className="button primary-button">
              SAVE
            </button>{' '}
            <button type="button" className="button" onClick={onCancel}>
              CANCEL
            </button>
          </div>
        </form>
        {!!DEBUG_STATE && <ShowJSONData data={{ state, props }} />}
      </div>
    )
  }
}

const Explainer = ({ children }) => (
  <p className="paragraph-s mts measure-wide" style={{ fontStyle: 'italic' }}>
    {children}
  </p>
)

const EditButton = ({ onClick, icon = 'icon-pen', ...props }) => (
  <button
    {...props}
    onClick={onClick}
    style={{ background: 'transparent', WebkitAppearance: 'none' }}>
    <small className="link">{!f.isEmpty(icon) && <i className={icon} />}</small>
  </button>
)

const AutocompleteAdder = ({ type, currentValues, ...props }) => (
  <span style={{ position: 'relative' }}>
    <AutoComplete
      className="block"
      name="autocompleter"
      {...props}
      resourceType={type}
      valueFilter={({ uuid }) => f.includes(f.map(currentValues, 'subject.uuid'), uuid)}
    />
  </span>
)

const MultiAdder = ({ currentUsers, currentGroups, currentApiClients, onAdd }) => (
  <div className="row pts pbm">
    <div className="col1of3">
      <div className="">
        Nutzer hinzufügen:{' '}
        <AutocompleteAdder type="Users" onSelect={onAdd} currentValues={currentUsers} />
      </div>
    </div>
    <div className="col1of3">
      <div className="pls">
        Gruppe hinzufügen:{' '}
        <AutocompleteAdder
          type="Groups"
          searchParams={{ scope: 'permissions' }}
          onSelect={onAdd}
          currentValues={currentGroups}
        />
      </div>
    </div>
    <div className="col1of3">
      <div className="pls">
        API-Client hinzufügen:{' '}
        <AutocompleteAdder type="ApiClients" onSelect={onAdd} currentValues={currentApiClients} />
      </div>
    </div>
  </div>
)

const SaveBusySignal = () => (
  <div className="pal" style={{ textAlign: 'center' }}>
    {'Saving…'}
  </div>
)

const ShowJSONData = ({ data }) => (
  <div>
    <hr />
    <pre className="mas pam code">{JSON.stringify(data, 0, 2)}</pre>
  </div>
)

const labelize = (resourceList, { withLink = false, onDelete } = {}) =>
  f.map(f.compact(resourceList), (resource, i) => ({
    key: `${resource.uuid}-${i}`,
    href: withLink ? resource.url : undefined,
    mod: resource.type.toLowerCase().replace(/.*group/, 'group'),
    mods: 'not-interactive',
    tag: 'span',
    children: (
      <span>
        {UI.resourceName(resource)}
        {!!onDelete && (
          <button
            className="multi-select-tag-remove"
            style={{ background: 'transparent' }}
            onClick={ev => {
              ev.preventDefault(), onDelete(resource)
            }}>
            <i className="icon-close"></i>
          </button>
        )}
      </span>
    )
  }))

const Let = ({ children, ...bindings }) => children(bindings)
