import React from 'react'
import ReactDOM from 'react-dom'
import xhr from 'xhr'
import url from 'url'
import qs from 'qs'
import l from 'lodash'

class SuperBox extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loadedResources: []
    }
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
      this.props.sparseParameter
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
            loadedResources: l.concat(last.loadedResources, resources)
          }
        })
      }
    )
  }

  componentDidMount() {
    this.loadPage()
  }


  render() {

    return (
      <div>
        <div>Super Box</div>
        <div>{this.props.baseUrl}</div>
        <div>{JSON.stringify(this.props.listParameters)}</div>
        <div>{this.calculateUrl()}</div>
        <div>{l.map(this.state.loadedResources, (r) => r.title)}</div>
      </div>
    )

  }
}

module.exports = SuperBox
