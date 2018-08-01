const RAD_TO_DEGREE = 180/Math.PI;

AFRAME.registerComponent('look-at-object', {
    schema: {
        objectID: {type: 'string', default: ""}
    },
    init: function () {
        this.objectToFollow = document.querySelector("#" + this.data.objectID).object3D;
        if (this.objectToFollow == null) {
            console.log('test');
        }
    },
    tick: function () {
      if (this.objectToFollow != null) {
          this.el.object3D.lookAt(this.objectToFollow.getWorldPosition());
      }
    }
});