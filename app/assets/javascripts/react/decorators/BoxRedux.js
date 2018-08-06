import __ from 'lodash'


var fireTreeEvent2 = function(eventTree, componentPath, componentId, event) {


  var path = componentPath
  var newEventTree = eventTree
  var current = newEventTree
  if(!path) {
    debugger
  }
  for(var i = 0; i < path.length; i++) {
    var pi = path[i]

    if(Array.isArray(pi)) {

      if(!current.children[pi[0]]) {
        current.children[pi[0]] = []
      }

      if(!current.children[pi[0]][pi[1]]) {
        current.children[pi[0]][pi[1]] = {
          children: {},
          event: null,
        }
      }
      current = current.children[pi[0]][pi[1]]


    } else {
      if(!current.children[pi]) {
        current.children[pi] = {
          children: {},
          event: null,
        }
      }
      current = current.children[pi]
    }

  }
  current.event = event
  current.componentId = componentId
  return newEventTree
}














var nextId = 0

var compactObject = function(o) {
  return __.fromPairs(
    __.compact(
      __.map(o, function(v, k) {
        return !v ? null : [k, v]
      })
    )
  )
}

var build = function(definition, last, rootTrigger, rootEventTree, merged) {

  return reduceComponent(definition, last, rootTrigger, rootEventTree, [], merged)
};




var reduceComponent = function(definition, last, rootTrigger, eventTree, path, merged) {

  var cid = null

  if(last && !definition.reset) {
    cid = last.id
  } else {
    cid = nextId
    nextId++
  }

  var useLast = (last && !definition.reset ? last : null)

  merged.initial = !useLast

  merged.nextProps = definition.props

  merged.trigger = rootTrigger

  merged.event = merged.event ? merged.event : {}

  var next = definition.reduce(
    merged
  )

  return {
    data: next.data,
    components: buildChildren2(next, useLast, rootTrigger, eventTree, path, merged),
    props: definition.props,
    id: cid,
    path: path
  }
}


var buildChildren2 = function(next, last, rootTrigger, eventTree, path, merged) {

  if(!next.components) {
    return null
  }


  return compactObject(__.mapValues(next.components, function(v, k) {

    if(!v) {
      return null
    }

    if(Array.isArray(v)) {

      var componentsArrayChild2 = function(vi, lastState, k, i) {
        if(typeof vi.reuseId == 'number') {
          return __.find(lastState.components[k], (ck) => ck.id == vi.reuseId)
        } else {
          return (lastState && lastState.components[k] && i < lastState.components[k].length ? lastState.components[k][i] : null)
        }

      }


      var mergedChild = function(vi, merged, k, i) {
        if(typeof vi.reuseId == 'number') {
          return __.find(merged.components[k], (ck) => ck.id == vi.reuseId)
        } else {
          return merged.components[k] && i < merged.components[k].length && merged.components[k][i] ? merged.components[k][i] : {
            data: {},
            components: {},
            // props: vi.props,
            event: {}
          }
        }

      }

      var eventTreeArrayChild2 = function(vi, last, eventTree, k, i) {
        if(typeof vi.reuseId == 'number') {
          return __.find(last.components[k], (ck) => ck.id == vi.reuseId)
        } else {
          return (eventTree && eventTree.children[k] ? eventTree.children[k][i] : {})
        }
        // if(typeof vi.reuseId == 'number') {
        //   return __.find(last.components[k], (ck) => ck.id == vi.reuseId)
        // } else {
        //   return (eventTree && eventTree.children[k] ? eventTree.children[k].arrYyy[i] : {})
        // }
      }

      var path2 = function(vi, last, eventTree, k, i, path) {
        if(typeof vi.reuseId == 'number') {
          var ind = __.findIndex(last.components[k], (ck) => ck.id == vi.reuseId)
          return __.concat(path, [[k, ind]])
        } else {
          return __.concat(path, [[k, i]])
        }

      }


      return __.map(
        v,
        function(vi, i) {
          return reduceComponent(
            vi,
            componentsArrayChild2(vi, merged, k, i),
            rootTrigger,
            eventTreeArrayChild2(vi, merged, eventTree, k, i),
            path2(vi, merged, eventTree, k, i, path),
            mergedChild(vi, merged, k, i)
          )
        }
      )
    }
    else {
      return reduceComponent(
        v,
        componentsChild(last, k),
        rootTrigger,
        eventTreeChild(eventTree, k),
        __.concat(path, k),
        merged.components[k] ? merged.components[k] : {
          data: {},
          components: {},
          // props: v.props,
          event: {}
        }
      )
    }
  }))
}


var eventTreeArrayChild = function(eventTree, k, i) {
  return (eventTree && eventTree.children[k] ? eventTree.children[k][i] : {})
}

var eventTreeChild = function(eventTree, k) {
  return (eventTree ? eventTree.children[k] : {})
}

var componentsArrayChild = function(lastState, k, i) {
  return (lastState && lastState.components[k] && i < lastState.components[k].length ? lastState.components[k][i] : null)
}

var componentsChild = function(last, k) {
  return last ? last.components[k] : null
}


var mergeStateAndEvents = function(lastState, eventTree) {

  if(!lastState) {
    return {
      data: {},
      components: {},
      path: [],
      props: {},
      event: {}
    }
  } else {
    return {
      id: lastState.id,
      data: (lastState.data ? lastState.data : {}),
      components: compactObject(
        __.mapValues(
          lastState.components,


          function(v, k) {

            if(!v) {
              return null
            }

            if(Array.isArray(v)) {

              return __.map(
                v,
                function(vi, i) {
                  return mergeStateAndEvents(
                    componentsArrayChild(lastState, k, i),
                    eventTreeArrayChild(eventTree, k, i)
                  )
                }
              )
            }
            else {
              return mergeStateAndEvents(
                lastState.components[k],
                (eventTree ? eventTree.children[k] : null)
              )
            }
          }




        )
      ),
      props: (lastState.props ? lastState.props : {}),
      event: (eventTree && eventTree.event ? eventTree.event : {}),
      path: lastState.path
    }
  }

  return null
}


module.exports = {

  build: function(stateReduction, lastState, eventTree, trigger) {

    var merged = mergeStateAndEvents(lastState, eventTree)

    return build(stateReduction, lastState, trigger, eventTree, merged);
  },

  fireTreeEvent: fireTreeEvent2
}
