import __ from 'lodash'


var fireTreeEvent2 = function(eventTree, componentPath, componentId, event) {
  var path = componentPath
  var newEventTree = eventTree
  var current = newEventTree
  for(var i = 0; i < path.length; i++) {
    var pi = path[i]

    if(Array.isArray(pi)) {

      if(!current.components[pi[0]]) {
        current.components[pi[0]] = []
      }

      if(!current.components[pi[0]][pi[1]]) {
        current.components[pi[0]][pi[1]] = {
          components: {},
          event: null,
        }
      }
      current = current.components[pi[0]][pi[1]]


    } else {
      if(!current.components[pi]) {
        current.components[pi] = {
          components: {},
          event: null,
        }
      }
      current = current.components[pi]
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


var mergeStateAndEvents = function(lastState, eventTree) {

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

                var componentsArrayChild = function(lastState, k, i) {
                  return (lastState && lastState.components[k] && i < lastState.components[k].length ? lastState.components[k][i] : null)
                }

                var eventTreeArrayChild = function(eventTree, k, i) {
                  return (eventTree && eventTree.components[k] ? eventTree.components[k][i] : {})
                }

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
              (eventTree ? eventTree.components[k] : null)
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

var mergeStateAndEventsRoot = function(lastState, eventTree) {
  if(!lastState) {
    return null
  } else {
    return mergeStateAndEvents(lastState, eventTree)
  }
}


module.exports = {

  fireTreeEvent: fireTreeEvent2,

  nextId: function() {
    var ret = nextId
    nextId++
    return ret
  },

  mergeStateAndEventsRoot: mergeStateAndEventsRoot
}
