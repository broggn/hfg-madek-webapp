import React, { Component, PropTypes } from 'react'
// FIXME: crashes server, required on mount!
let videojs = null
import cx from 'classnames'
import omit from 'lodash/omit'
import merge from 'lodash/merge'
import isFunction from 'lodash/isFunction'
const noop = () => ({})

// NOTE: this is used from Video- and AudioPlayer. `props.mode=audio|video`
// mode needs to be known because of conditional registering of plugins etc
const defaultProps = {
  mode: 'video',
  controls: true,
  preload: 'auto',
  onMount: noop,
  onReady: noop
}

const propTypes = {
  mode: PropTypes.oneOf([ 'audio', 'video' ]),
  sources: PropTypes.array,
  children: PropTypes.node
}

const DEFAULT_OPTIONS = { fluid: true }

class VideoJS extends Component {
  constructor () {
    super()
    this.state = { active: !!(window && window.document) }
    this.toCallOnUnmount = []
  }

  componentDidMount () {
    const videoTag = this.refs.videojs
    if (!videoTag) throw new Error('no video tag!')

    videojs = require('video.js')
    const playerOptions = merge({}, DEFAULT_OPTIONS, this.props.options)

    if (this.props.doInit) {
      this.props.doInit({ videoTag, videojs, playerOptions })
    } else {
      // make library available to our plugins and other extensions:
      window.videojs = videojs
      if (this.props.mode === 'video') {
        require('videojs-resolution-switcher')
      }

      // init/start
      const player = videojs(videoTag, playerOptions)
      this.toCallOnUnmount.push(player.destroy)

      // parent callbacks
      player.ready(() => this.props.onReady(player))
    }
  }

  componentWillUnmount () {
    (this.toCallOnUnmount || []).forEach(f => isFunction(f) && f())
  }
  render () {
    const { sources, children, mode, options, ...restProps } = this.props
    if (!children && !sources) throw new TypeError()

    const MediaTag = mode
    const mediaProps = omit(restProps, 'onMount', 'onReady', 'doInit')

    const classes = cx(
      this.props.className,
      'videojs video-js video-fluid vjs-default-skin'
    )

    return (
      <MediaTag
        ref='videojs'
        {...mediaProps}
        height={options.height}
        width={options.width}
        className={classes}
      >
        {children || sources.map(src => <source {...src} />)}
      </MediaTag>
    )
  }
}

VideoJS.propTypes = propTypes
VideoJS.defaultProps = defaultProps
export default VideoJS
