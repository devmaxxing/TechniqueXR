AFRAME.registerComponent('tt-ball-shooter', {
    schema: {
        velocityX: {type: 'number', default: 0},
        velocityY: {type: 'number', default: 0},
        velocityZ: {type: 'number', default: 1}
    },
    init: function () {
        this.raycaster = new THREE.Raycaster();
        this.racket = document.querySelector('#racket');
        this.el.addEventListener('body-loaded', () => {
            this.startPosition = this.el.body.position.clone();
            this.el.addEventListener('collide', (e) => {
                if (e.detail.body.el.id === 'ground') {
                    this.el.body.position.copy(this.startPosition);
                    this.el.body.quaternion.set(0, 0, 0, 1);
                    this.el.body.angularVelocity.setZero();
                    this.el.body.velocity.set(this.data.velocityX, this.data.velocityY, this.data.velocityZ);
                }
            });
            this.el.body.velocity.set(this.data.velocityX, this.data.velocityY, this.data.velocityZ);
        });
    },
    // tick: function() {
    //     if (this.el.body) {
    //         var arr;
    //         const body = this.el.body;
    //         this.raycaster.set(body.position.clone(), body.velocity.clone().unit());
    //         this.raycaster.far = body.velocity.length();
    //         arr = this.raycaster.intersectObject(this.racket.object3D);

    //         if(arr.length){
    //             body.position.copy(arr[0].point);
    //             const velocityTracker = this.racket.components['velocity-tracker'];
    //             const appliedForce = new CANNON.Vec3(velocityTracker.velocityX, velocityTracker.velocityY, velocityTracker.velocityZ);
    //             body.applyLocalForce(appliedForce, arr[0].point);
    //         }
    //     }
    // }
});