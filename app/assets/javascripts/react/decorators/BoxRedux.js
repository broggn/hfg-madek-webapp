import __ from 'lodash'


var fireTreeEvent2 = function(eventTree, componentPath, componentId, event, eventArgs) {


  var path = componentPath
  var newEventTree = eventTree
  var current = newEventTree
  for(var i = 0; i < path.length; i++) {
    var pi = path[i]

    if(Array.isArray(pi)) {

      if(!current.children[pi[0]]) {
        current.children[pi[0]] = {
          isArray: true,
          arrYyy: {}
        }
      }

      if(!current.children[pi[0]].arrYyy[pi[1]]) {
        current.children[pi[0]].arrYyy[pi[1]] = {
          children: {},
          events: {},
        }
      }
      current = current.children[pi[0]].arrYyy[pi[1]]


    } else {
      if(!current.children[pi]) {
        current.children[pi] = {
          children: {},
          events: {},
          isArray: false
        }
      }
      current = current.children[pi]
    }

  }
  current.events[event] = {args: eventArgs}
  current.componentId = componentId
  return newEventTree
}














var nextId = 0

var machine = function(def, reset) {
  return {
    def: def
  }
}

var compactObject = function(o) {
  return __.fromPairs(
    __.compact(
      __.map(o, function(v, k) {
        return !v ? null : [k, v]
      })
    )
  )
}

var build = function(v, last, rootTrigger, rootEventTree) {

  if(last && !verifyEventId2(last, rootEventTree)) {
    console.log('not valid tree anymore ' + JSON.stringify(rootEventTree))
    return last
  }

  // console.log(JSON.stringify(rootEventTree, null, '  '))
  return buildChild2(v, last, rootTrigger, rootEventTree, [], null, null, null)
};




var verifyEventId2 = function(llast, leventTree) {

  var verifyRec = function(last, eventTree) {

    if(eventTree.componentId != undefined) {
      if(eventTree.componentId != last.id) {
        return false
      }
    }

    for(var c in eventTree.children) {
      var childTree = eventTree.children[c]
      var childLast = last.component.components[c]

      if(!childLast) {
        return false
      }

      if(childTree.isArray) {
        // debugger
        for(var i in childTree.arrYyy) {

          if(!childLast[i]) {
            return false
          }

          if(!verifyRec(childLast[i], childTree.arrYyy[i])) {
            return false
          }
        }



      } else {

        if(!verifyRec(childLast, childTree)) {
          return false
        }

      }


    }

    return true

  }
  return verifyRec(llast, leventTree)
}


var buildChild2 = function(v, last, rootTrigger, eventTree, path, rootEvent, childEventPath, eventArgs) {

  var cid = null

  if(last && !v.reset) {
    cid = last.id
  } else {
    cid = nextId
    nextId++
  }

  var cDef = v
  var r = {
    component: buildComponent2(cid, cDef, (last && !v.reset ? last : null), rootTrigger, eventTree, path, rootEvent, childEventPath, eventArgs),
    id: cid,
    path: path
  }
  r.child = function(ck) { return r.component.components[ck] }
  r.data = function() { return r.component.data }
  r.childValue = function(ck) {
    return r.component.data[ck]
  }
  // r.getValue = function() { return r.component.value }
  return r
}


var buildChildren2 = function(next, last, rootTrigger, eventTree, path, rootEvent, eventPath, eventArgs) {

  if(!next) {
    return null
  }

  var newMachines = null

  if(next.components) {


  var newMachines = compactObject(__.map(next.components, function(v, k) {

    if(!v) {
      return null
    }

    if(Array.isArray(v)) {

      return __.map(
        v,
        function(vi, i) {

          var lastChild = last && last.component.components[k] && i < last.component.components[k].length ? last.component.components[k][i] : null
          var childEventPath = __.first(__.first(eventPath)) == k && __.last(__.first(eventPath)) == i ? __.tail(eventPath) : null
          var childPath = __.concat(path, [[k, i]])
          // debugger
          return buildChild2(vi, lastChild, rootTrigger, (eventTree && eventTree.children[k] ? eventTree.children[k].arrYyy[i] : null), childPath, rootEvent, childEventPath, eventArgs)

        }
      )
    }
    else

    // if(v.type == 'state') {
      var lastChild = last ? last.component.components[k] : null
      var childEventPath = __.first(eventPath) == k ? __.tail(eventPath) : null
      var childPath = __.concat(path, k)
      return buildChild2(v, lastChild, rootTrigger, (eventTree ? eventTree.children[k] : null), childPath, rootEvent, childEventPath, eventArgs)
    // } else {
    //   var r = {
    //     component: v
    //   }
    //   r.getValue = function() { return r.component.value }
    //   return r
    // }
  }))

  }


  return {
    data: next.data,
    components: newMachines
  }

}


var buildComponent2 = function(id, def, last, rootTrigger, eventTree, path, rootEvent, eventPath, eventArgs) {

  // if(!eventTree) {
  //   debugger
  // }

  // TODO TODO TODO TODO TODO until now we check only if there was a state before already.
  // however we should also check if it is still of the same type.
  // perhaps a property is once a value and then a state, or first a state of class a and the of class b.

  // if(!last && eventPath && eventPath.length == 0) {
  //   throw 'not possible'
  // }

  var isChildEventRec = function(path, name, leventTree, llast) {


    if(!leventTree) {
      return false
    }

    if(path.length == 0) {
      // if(leventTree.events[name]) {
      //   debugger
      // }

      if(!leventTree || !leventTree.events) {
        debugger
      }
      if(!leventTree.events[name]) {
        return false
      }

      if(leventTree.componentId != llast.id) {
        console.log('not valid child anymore ' + JSON.stringify(eventTree))
        return false
      }

      return true
    }

    // debugger
    //
    // if(path.length == 1) {
    //   var pi = path[0]
    //   if(!)
    //   return (eventTree.events[pi] ? true : false)
    // }


    var pi = __.head(path)
    var r = __.tail(path)

    if(!Array.isArray(pi)) {

      if(!leventTree.children[pi]) {
        return false
      }

      return isChildEventRec(r, name, leventTree.children[pi], llast.child(pi))

    } else {

      if(pi[1] == '*') {

        if(!leventTree.children[pi[0]]) {
          return false
        }

        var obj = leventTree.children[pi[0]].arrYyy
        for(var i in obj) {
          // debugger
          if(isChildEventRec(r, name, obj[i], llast.component.components[pi[0]][i])) {
            return true
          }
        }

        return false


      } else {

        if(!leventTree.children[pi]) {
          return false
        }
        return isChildEventRec(r, name, leventTree.children[pi], llast.child(pi))
      }

    }



  }

  var info = {
    trigger: function(event, eventArgs) {

      var newEventTree = {
        componentId: 0,
        events: {},
        children: {}
      }

    var newEventTree = fireTreeEvent2(newEventTree, path, id, event, eventArgs)



      rootTrigger(newEventTree)
    },
    eventTree: function() {return eventTree},
    eventPath: function() { return eventPath },
    lastData: function() { return last.component.data },
    lastValue: function(key) { /*TODO support array*/ return last.component.data[key] },
    isEvent: function(name) {
      if(!(eventTree && eventTree.events[name])) {
        return false
      }
      // if(eventTree.componentId != last.id) {
      //   console.log('not valid anymore ' + JSON.stringify(eventTree))
      //   return false
      // }
      return true
    },
    isChildEvent: function(path, name) {
      // debugger
      return isChildEventRec(path, name, eventTree, last)
    },
    isInitial: function() { return !last },
    childEventArgs: function(path, key) {
      // TODO support paths with array keys
      var current = eventTree
      for(var i = 0; i < path.length; i++) {
        var pi = path[i]
        current = current.children[pi]
      }
      return current.events[key].args
    },
    eventArgs: function(key) {
      // debugger
      return eventTree.events[key].args
    }
  }

  info.child = function(key) { return last.component.components[key] }
  info.lastLength = function(key) { return last.component.components[key].length }

  var next = def.step(info)

  return buildChildren2(next, last, rootTrigger, eventTree, path, rootEvent, eventPath, eventArgs)

};


module.exports = {

  build: function(stateReduction, lastState, eventTree, trigger) {
    return build(stateReduction, lastState, trigger, eventTree);
  },

  machine: function(stateReduction, reset) {
    return machine(stateReduction, reset);
  }
}
