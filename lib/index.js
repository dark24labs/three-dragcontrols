var THREE = require('three');

/*
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * Running this will allow you to drag three.js objects around the screen.
 */

function DragControls(_objects, _options, _camera, _domElement) {

  if (_objects instanceof THREE.Camera) {

    console.warn('THREE.DragControls: Constructor now expects ( objects, camera, domElement )');
    var temp = _objects;
    _objects = _camera;
    _camera = temp;

  }

  var _defaults = {
    moveable: true,
    cursors: false,
  };

  var _options = {..._defaults, ..._options};

  var _plane = new THREE.Plane();
  var _raycaster = new THREE.Raycaster();

  var _mouse = new THREE.Vector2();
  var _offset = new THREE.Vector3();
  var _intersection = new THREE.Vector3();

  var _selected = null;
  var _hovered = null;

  var _click = {x: null, y: null};
  var _timestamp = null;

  //

  var scope = this;

  function activate() {

    _domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    _domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    _domElement.addEventListener('mouseup', onDocumentMouseCancel, false);
    _domElement.addEventListener('mouseleave', onDocumentMouseCancel, false);
    _domElement.addEventListener('touchmove', onDocumentTouchMove, false);
    _domElement.addEventListener('touchstart', onDocumentTouchStart, false);
    _domElement.addEventListener('touchend', onDocumentTouchEnd, false);

  }

  function deactivate() {

    _domElement.removeEventListener('mousemove', onDocumentMouseMove, false);
    _domElement.removeEventListener('mousedown', onDocumentMouseDown, false);
    _domElement.removeEventListener('mouseup', onDocumentMouseCancel, false);
    _domElement.removeEventListener('mouseleave', onDocumentMouseCancel, false);
    _domElement.removeEventListener('touchmove', onDocumentTouchMove, false);
    _domElement.removeEventListener('touchstart', onDocumentTouchStart, false);
    _domElement.removeEventListener('touchend', onDocumentTouchEnd, false);

  }

  function dispose() {

    deactivate();

  }

  function onDocumentMouseMove(event) {
    if ( !_camera.active ) return;
    event.preventDefault();

    var rect = _domElement.getBoundingClientRect();

    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, _camera);

    if (_selected && scope.enabled && _options.moveable) {

      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {

        _selected.position.copy(_intersection.sub(_offset));

      }

      scope.dispatchEvent({
        type: 'drag',
        object: _selected,
        event: event
      });

      return;

    }

    _raycaster.setFromCamera(_mouse, _camera);

    var intersects = _raycaster.intersectObjects(_objects);

    if (intersects.length > 0) {

      var object = intersects[0].object;

      _plane.setFromNormalAndCoplanarPoint(_camera.getWorldDirection(_plane.normal), object.position);

      if (_hovered !== object) {

        scope.dispatchEvent({
          type: 'hoveron',
          object: object
        });

        if ( _options.cursors ) _domElement.style.cursor = 'pointer';
        _hovered = object;

      }

    } else {

      if (_hovered !== null) {

        scope.dispatchEvent({
          type: 'hoveroff',
          object: _hovered
        });

        if ( _options.cursors ) _domElement.style.cursor = 'auto';
        _hovered = null;

      }

    }

  }

  function onDocumentMouseDown(event) {
    if ( !_camera.active ) return;
    event.preventDefault();

    _raycaster.setFromCamera(_mouse, _camera);

    var intersects = _raycaster.intersectObjects(_objects);

    if (intersects.length > 0) {

      _selected = intersects[0].object;

      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {

        _offset.copy(_intersection).sub(_selected.position);

      }

      if ( _options.cursors && _options.moveable ) _domElement.style.cursor = 'move';

	  if ( _options.moveable ) {
		scope.dispatchEvent({
		  type: 'dragstart',
          object: _selected,
          event: event
		});
	  }

	  _click.x = event.clientX;
	  _click.y = event.clientY;

    }


  }

  function onDocumentMouseCancel(event) {
    if ( !_camera.active ) return;
    event.preventDefault();

    if (_selected) {
	  if (_click.x==event.clientX && _click.y==event.clientY) {
		scope.dispatchEvent( { type: 'click', object: _selected } );
	  }

	  if ( _timestamp && (Date.now()-200)<=_timestamp ) {
		scope.dispatchEvent( { type: 'dbclick', object: _selected } );
	  }

      if ( _options.moveable ) {
		scope.dispatchEvent({
          type: 'dragend',
          object: _selected,
          event: event
		});
	  }

      _selected = null;

    }

	_click.x = 0;
	_click.y = 0;
	_timestamp = Date.now();

    if ( _options.cursors ) _domElement.style.cursor = 'auto';

  }

  function onDocumentTouchMove(event) {
    if ( !_camera.active ) return;
    event.preventDefault();
    event = event.changedTouches[0];

    var rect = _domElement.getBoundingClientRect();

    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, _camera);

    if (_selected && scope.enabled && _options.moveable) {

      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {

        _selected.position.copy(_intersection.sub(_offset));

      }

      scope.dispatchEvent({
        type: 'drag',
        object: _selected,
        event: event
      });

      return;

    }

  }

  function onDocumentTouchStart(event) {
    if ( !_camera.active ) return;
    event.preventDefault();
    event = event.changedTouches[0];

    var rect = _domElement.getBoundingClientRect();

    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, _camera);

    var intersects = _raycaster.intersectObjects(_objects);

    if (intersects.length > 0) {

      _selected = intersects[0].object;

      _plane.setFromNormalAndCoplanarPoint(_camera.getWorldDirection(_plane.normal), _selected.position);

      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {

        _offset.copy(_intersection).sub(_selected.position);

      }

      if ( _options.cursors && _options.moveable ) _domElement.style.cursor = 'move';

      scope.dispatchEvent({
        type: 'dragstart',
        object: _selected
      });

    }


  }

  function onDocumentTouchEnd(event) {
    if ( !_camera.active ) return;
    event.preventDefault();

    if (_selected) {

      scope.dispatchEvent({
        type: 'dragend',
        object: _selected
      });

      _selected = null;

    }

    if ( _options.cursors ) _domElement.style.cursor = 'auto';

  }

  activate();

  // API

  this.enabled = true;

  this.activate = activate;
  this.deactivate = deactivate;
  this.dispose = dispose;

  // Backward compatibility

  this.setObjects = function() {

    console.error('THREE.DragControls: setObjects() has been removed.');

  };

  this.on = function(type, listener) {

    console.warn('THREE.DragControls: on() has been deprecated. Use addEventListener() instead.');
    scope.addEventListener(type, listener);

  };

  this.off = function(type, listener) {

    console.warn('THREE.DragControls: off() has been deprecated. Use removeEventListener() instead.');
    scope.removeEventListener(type, listener);

  };

  this.notify = function(type) {

    console.error('THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead.');
    scope.dispatchEvent({
      type: type
    });

  };

  this.setOption = function(option, value) {

    _options[option] = value;

  };

}

DragControls.prototype = Object.create(THREE.EventDispatcher.prototype);
DragControls.prototype.constructor = DragControls;

module.exports = DragControls;