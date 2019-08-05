import React from 'react'
import f from 'lodash'

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
import RailsForm from '../../lib/forms/rails-form.cjsx'
// import ui from '../../lib/ui.coffee'
// const t = ui.t
import app from 'ampersand-app'
let AutoComplete = false // client-side only!

// const fakeCallback = (a, b, c) => console.log(a, b, c) // eslint-disable-line no-console

// TODO: move to translations.csv
const UI_TXT = {
  feature_title: { de: 'Prozess', en: 'Workflow' },

  associated_collections_title: { de: 'Set mit Inhalten', en: 'Set with content' },
  associated_collections_explain: [
    `In diesem Set enthaltene Inhalte können vor dem Abschluss nur als Teil dieses Prozesses bearbeitet werden.`,
    `Content contained in this set may only be considered as part of this workflow prior to completion to be edited.`
  ],
  associated_collections_upload: { de: 'Medien hinzufügen', en: 'Add media' },

  workflow_owners_title: { de: 'Prozess-Besitzer', en: 'Workflow owners' },

  common_settings_title: { de: 'Gemeinsamer Datensatz', en: 'Common data' },
  common_settings_explain: [
    `Diese Daten und Einstellungen gelten für alle enthaltenen Inhalte und werden bei
     Prozessabschluss permanent angewendet.`,
    `These data and settings apply to all contents and are permanently applied at the end of the process.`
  ],
  common_settings_permissions_title: { de: 'Berechtigungen', en: 'Permissions' },
  common_settings_permissions_responsible: { de: 'Verantwortlich', en: 'Responsible' },
  common_settings_permissions_write: { de: 'Schreib- und Leserechte', en: 'Read and write rights' },
  common_settings_permissions_read: { de: 'Nur Leserechte', en: 'Only reading rights' },
  common_settings_permissions_read_public: { de: 'Öffentlicher Zugriff', en: 'Public access' },
  common_settings_metadata_title: { de: 'MetaDaten', en: 'MetaData' },

  actions_back: { de: 'Zurück', en: 'Go back' },
  actions_validate: { de: 'Prüfen', en: 'Check' },
  actions_finish: { de: 'Abschliessen…', en: 'Finish…' }
}

const t = key => {
  const locale = app.config.userLanguage
  return f.get(UI_TXT, [key, locale])
}

const WORKFLOW_STATES = { IN_PROGRESS: 'IN_PROGRESS', FINISHED: 'FINISHED' }

class WorkflowEdit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isEditingPermissions: false,
      isSavingPermissions: false,
      isEditingMetadata: false,
      isSavingMetadata: false,
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
    this.setState({ isSavingPermissions: true })
    const data = { commonPermissions }
    // TODO: ajax
    console.log('FAKE AJAX: POST common_permissions', { data }) // eslint-disable-line no-console
    setTimeout(() => {
      this.setState({ commonPermissions, isSavingPermissions: false, isEditingPermissions: false })
    }, 1500)
  }

  onToggleEditMetadata(event) {
    event.preventDefault()
    this.setState(cur => ({ isEditingMetadata: cur.isEditingMetadata ? false : Date.now() }))
  }
  onSaveMetadata(commonMetadata) {
    this.setState({ isSavingMetadata: true })
    const data = { commonMetadata }
    // TODO: ajax
    console.log('FAKE AJAX: POST common_metadata', { data }) // eslint-disable-line no-console
    setTimeout(() => {
      this.setState({ commonMetadata, isEditingMetadata: false, isSavingMetadata: false })
    }, 1500)
  }

  render({ props, state, actions } = this) {
    const { name, status, responsible_people, common_settings } = props.get

    return (
      <div>
        <WorkflowEditor
          {...{ name, status, responsible_people, common_settings }}
          {...state}
          {...actions}
        />
        <hr />
        <pre className="mas pam code">{JSON.stringify({ state, props }, 0, 2)}</pre>
      </div>
    )
  }
}

const WorkflowEditor = ({
  name,
  status,
  responsible_people,

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
              {/*<DummySetThumb />*/}
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
          {/* FIXME: <UI.TagCloud mod="person" mods="small" list={UI.labelize(workflow_owners)} /> */}
          <UI.TagCloud mod="person" mods="small" list={labelize(responsible_people)} />
        </SubSection>

        <SubSection>
          <SubSection.Title tag="h2" className="title-m mts">
            {t('common_settings_title')}
          </SubSection.Title>

          <Explainer>{t('common_settings_explain')}</Explainer>

          <SubSection>
            <SubSection.Title tag="h3" className="title-s mts">
              {t('common_settings_permissions_title')}
              {'  '}
              {!isEditingPermissions && <EditButton onClick={onToggleEditPermissions} />}
            </SubSection.Title>

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
                  <UI.TagCloud
                    mod="person"
                    mods="small inline"
                    list={labelize([commonPermissions.responsible])}
                  />
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
          </SubSection>

          <SubSection open>
            <SubSection.Title tag="h3" className="title-s mts">
              {t('common_settings_metadata_title')}
              {'  '}
              {!isEditingPermissions && <EditButton onClick={onToggleEditMetadata} />}
            </SubSection.Title>

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
                {commonMetadata.map(({ key, value }) => (
                  <li key={key}>
                    <b>{key}:</b> {value}
                  </li>
                ))}
              </ul>
            )}
          </SubSection>
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

class MetadataEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = { md: this.props.commonMetadata }
    AutoComplete = AutoComplete || require('../../lib/autocomplete.cjsx')
    this.onChangeMdValue = this.onChangeMdValue.bind(this)
    this.onAddMd = this.onAddMd.bind(this)
    this.onRemoveMd = this.onRemoveMd.bind(this)
  }

  onChangeMdValue({ target }) {
    this.setState(cur => ({
      md: cur.md.map(md => (md.key !== target.name ? md : { key: md.key, value: target.value }))
    }))
  }
  onAddMd({ metaKeyId }) {
    this.setState(cur => ({ md: cur.md.concat([{ key: metaKeyId, value: '' }]) }))
  }
  onRemoveMd({ metaKeyId }) {
    this.setState(cur => ({ md: cur.md.filter(md => md.key !== metaKeyId) }))
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
              <li key={i} className="ui-form-group pan pts columned">
                <label htmlFor={`emk_${i}`} className="form-label">
                  {md.key}
                </label>
                <div className="form-item">
                  <input
                    type="text"
                    className="block"
                    id={`emk_${i}`}
                    name={md.key}
                    value={md.value}
                    onChange={this.onChangeMdValue}
                  />
                </div>
              </li>
            ))}
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
        <hr />
        <pre className="mas pam code">{JSON.stringify({ state }, 0, 2)}</pre>
      </div>
    )
  }
}

class PermissionsEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = { ...this.props.commonPermissions }
    AutoComplete = AutoComplete || require('../../lib/autocomplete.cjsx')
    this.onTogglePublicRead = this.onTogglePublicRead.bind(this)
    this.onAddPermissionEntity = this.onAddPermissionEntity.bind(this)
    this.onRemovePermissionEntity = this.onRemovePermissionEntity.bind(this)
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
              <input />
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
              {/* {commonPermissions.read_public ? (
            <i className="icon-checkmark" title="Ja" />
          ) : (
            <i className="icon-close" title="Nein" />
          )} */}
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
        <hr />
        <pre className="mas pam code">{JSON.stringify({ state }, 0, 2)}</pre>
      </div>
    )
  }
}

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
  <ul className="plm" style={{ width: '25rem' }}>
    <li>
      Nutzer hinzufügen:{' '}
      <AutocompleteAdder type="Users" onSelect={onAdd} currentValues={currentUsers} />
    </li>
    <li>
      Gruppe hinzufügen:{' '}
      <AutocompleteAdder
        type="Groups"
        searchParams={{ scope: 'permissions' }}
        onSelect={onAdd}
        currentValues={currentGroups}
      />
    </li>
    <li>
      API-Client hinzufügen:{' '}
      <AutocompleteAdder type="ApiClients" onSelect={onAdd} currentValues={currentApiClients} />
    </li>
  </ul>
)

const labelize = (resourceList, { withLink = false, onDelete } = {}) =>
  resourceList.map((resource, i) => ({
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

const SaveBusySignal = () => (
  <div className="pal" style={{ textAlign: 'center' }}>
    {'Saving…'}
  </div>
)
