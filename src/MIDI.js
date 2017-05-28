//@author github.com/mog
var MIDI = function(error) {
    
    "use strict";
    
    var _inputs = [],
        _outputs = [],
        
        _eventList = {};
        
    function handleInput(event){
        
        var data = event.data,
            id = data[1],
            val = data[2];
        
        if (data[0] == 254 || data[0] == 248)
            return;
        
        if(_eventList[ id ])
            for(var i = 0, len = _eventList[ id ].length; i < len; i++ )
                _eventList[ id ][i]( val, event );
        
        if(_eventList[ 'any' ])
            for(i = 0, len = _eventList[ 'any' ].length; i < len; i++ )
                _eventList[ 'any' ][i]( val, event );
    }
    
    (function init(){
        try { 
            navigator.requestMIDIAccess().then(function(midi) {
        
                for (var i = midi.inputs.values(), o = i.next(); !o.done; o = i.next()) {
                    _inputs.push(o.value);
                }
        
                for (i = midi.outputs.values(), o = i.next(); !o.done; o = i.next()) {
                    _outputs.push(o.value);
                }

                _inputs.forEach(function(input) {
                    input.onmidimessage = handleInput;
                });
            });
        } catch(e) {
            if(error) error(e);
        }
    })();

    function bind(key, fn){
        
        if(!_eventList[key])
            _eventList[key] = [];
        
        _eventList[key].push(fn);
    }

    function unbind(key, fn){
        
        if(_eventList[ key ]){
            for(var i = 0, len = _eventList[ id ].length; i < len; i++ ){
                if(fn === _eventList[ id ][i])
                    _eventList[ id ].splice(i, 1);
                    break;
            }
            
            if(_eventList[ id ].length === 0)
                delete _eventList[ id ];
        }
    }

    return {
        on:bind,
        off:unbind,
        inputs: _inputs
    };
};