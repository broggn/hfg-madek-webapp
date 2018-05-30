import React from 'react'
import ReactDOM from 'react-dom'
import xhr from 'xhr'
import url from 'url'
import qs from 'qs'
import l from 'lodash'
import Scrolling from './Scrolling.js'

class SuperBox extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loadingNext: false,
      asyncResources: []
    }
  }

  componentDidMount() {
    Scrolling.mount(this.tryLoadNext.bind(this))
    this.tryLoadNext()
  }

  componentWillUnmount() {
    Scrolling.unmount(this.tryLoadNext.bind(this))
  }

  pagination() {
    return this.props.initialGet.pagination
  }

  totalCount() {
    return this.pagination().total_count
  }

  hasMoreToLoad() {
    return l.size(this.loadedResources()) < this.totalCount()
  }

  tryLoadNext() {

    if(!Scrolling._isBottom()) {
      return
    }

    if(this.state.loadingNext) {
      return
    }

    if(!this.hasMoreToLoad()) {
      return
    }

    this.setState({
      loadingNext: true
    }, () => {
      this.loadPage()
    })
  }

  perPage() {
    return this.props.initialGet.config.per_page
  }


  loadedResources() {
    return l.concat(this.props.initialGet.resources, this.state.asyncResources)
  }

  nextPage() {
    return Math.ceil(l.size(this.loadedResources()) / this.perPage()) + 1
  }

  ajaxGet(urlWithParams, callback) {
    xhr.get(
      {
        url: urlWithParams,
        json: true
      },
      (err, res, json) => {
        callback(json)
      }
    )
  }

  calculateParameters() {
    return l.merge(
      this.props.listParameters,
      this.props.sparseParameter,
      {list: {page: this.nextPage()}}
    )
  }

  calculateUrl() {
    var u = url.parse(this.props.baseUrl)
    u.search = '?' + qs.stringify(
      this.calculateParameters(),
      {
        skipNulls: true,
        arrayFormat: 'brackets'
      }
    )
    return url.format(u)
  }

  loadPage() {
    this.ajaxGet(
      this.calculateUrl(),
      (json) => {
        var resources = this.props.extractResources(json)
        this.setState((last) => {
          return {
            asyncResources: l.concat(last.asyncResources, resources),
            loadingNext: false
          }
        }, () => {
          this.tryLoadNext()
        })
      }
    )
  }

  render() {

    return (
      <div>
        <div>Super Box</div>
        <div>{this.props.baseUrl}</div>
        <div>{JSON.stringify(this.props.listParameters)}</div>
        <div>{this.calculateUrl()}</div>
        <div>{l.map(this.loadedResources(), (r) => r.title)}</div>
      </div>
    )

  }
}

module.exports = SuperBox
