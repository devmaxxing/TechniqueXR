AFRAME.registerComponent('velocity-tracker', {
    init: function() {
        this.previousX = 0;
        this.previousY = 0;
        this.previousZ = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.velocityZ = 0;
    },
    tick: function(time, timeDelta) {
        const currentPosition = this.el.object3D.getWorldPosition();
        this.velocityZ = (currentPosition.z - this.previousZ) / timeDelta;
        this.velocityY = (currentPosition.y - this.previousY) / timeDelta;
        this.velocityX = (currentPosition.x - this.previousX) / timeDelta;
        this.previousX = currentPosition.x;
        this.previousY = currentPosition.y;
        this.previousZ = currentPosition.z;
    }
});