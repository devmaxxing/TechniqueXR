AFRAME.registerComponent('object-hit', {
    schema: {
        objectToAnchor: {type:'string', default:''}
    },
    init: function () {
      if (!this.el.isScene) {
        console.warn('hit-test component can only be applied to <a-scene>');
        return;
      }
      this.tapData = null;
      this.objectToAnchor = document.querySelector(this.data.objectToAnchor);
      this.bindMethods();
      this.scene = this.el.sceneEl;
      this.scene.addEventListener('xrInitialized', this.xrInitialized);
      this.scene.addEventListener('realityChanged', this.realityChanged);
    },
    bindMethods: function (){
      this.xrInitialized = this.xrInitialized.bind(this);
      this.realityChanged = this.realityChanged.bind(this);
      this.updateFrame = this.updateFrame.bind(this);
      this.onTouchStart = this.onTouchStart.bind(this);
    },
    xrInitialized: function () {
      this.scene.removeEventListener('xrInitialized', this.xrInitialized);
      this.xrIsInit = true;
      // normalized device coordinates position
      this.normalizedCoordinatedPositionPointer = new THREE.Vector2();
      //Screen coordinates normalized to -1..1 (0,0 is at center and 1,1 is at top right)
      this.coordinatesToFindAnchors = new THREE.Vector2(0.5, 0.5);
      window.addEventListener('touchstart', this.onTouchStart);

      if (this.isNotStartedYet) {
        this.start();
      }
    },
    realityChanged: function (data) {
      if (data.detail === 'ar') {
        if (AFRAME.scenes[0].systems.xr.supportAR) {
          if (this.xrIsInit) {
            this.start();
          } else {
            this.isNotStartedYet = true;
          }
        }
      }
    },
    start: function () {
      this.scene.addEventListener('updateFrame', this.updateFrame);
    },
    onTouchStart: function (ev) {
      if (!ev.touches || ev.touches.length === 0) {
        console.error('No touches on touch event', ev);
        return
      }
      this.tapData = [
        ev.touches[0].clientX / window.innerWidth,
        ev.touches[0].clientY / window.innerHeight
      ];
    },
    /*
    Add a node to the scene and keep its pose updated using the anchorOffset
    */

    updateFrame: function (data) {
      var frame = data.detail;
      if (this.tapData !== null) {
        var x = this.tapData[0];
        var y = this.tapData[1];
        this.tapData = null;
        var self = this;
        data.detail.findAnchor(x,y).then(function (anchorOffset) {
          if (anchorOffset === null){
            alert('Unable to find anchor. Please try again.');
          } else {
            // will set the position and orientation based on the anchorOffset attached to the entity
            this.objectToAnchor.setAttribute('xranchor', {});
            this.objectToAnchor.components.xranchor.anchorOffset = anchorOffset;
            
            self.el.emit('anchorUpdated', entity);
          }
        }).catch(function (err) {
          console.error('Error in hit test', err);
        });
      }
    }
});