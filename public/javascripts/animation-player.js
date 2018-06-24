const LoopMode = {
  once: THREE.LoopOnce,
  repeat: THREE.LoopRepeat,
  pingpong: THREE.LoopPingPong
};

AFRAME.registerComponent("animation-player", {
  schema: {
    clip: { default: "*" },
    duration: { default: 0 },
    crossFadeDuration: { default: 0 },
    loop: { default: "repeat", oneOf: Object.keys(LoopMode) },
    repetitions: { default: Infinity, min: 0 },
    speed: { default: 1.0 },
    paused: {default: false},
    currentTime: { default: -1}
  },

  init: function() {
    /** @type {THREE.Mesh} */
    this.model = null;
    /** @type {THREE.AnimationMixer} */
    this.mixer = null;
    /** @type {Array<THREE.AnimationAction>} */
    this.activeActions = [];

    const model = this.el.getObject3D("mesh");

    if (model) {
      this.load(model);
      this.playAction();
    } else {
      this.el.addEventListener("model-loaded", e => {
        this.load(e.detail.model);
        this.playAction();
      });
    }
  },

  load: function(model) {
    const el = this.el;
    this.model = model;
    this.mixer = new THREE.AnimationMixer(model);
    this.mixer.addEventListener("loop", e => {
      el.emit("animation-loop", { action: e.action, loopDelta: e.loopDelta, time: this.mixer.time});
    });
    this.mixer.addEventListener("finished", e => {
      el.emit("animation-finished", {
        action: e.action,
        direction: e.direction
      });
    });
    if (this.data.clip) this.update({});
  },

  remove: function() {
    if (this.mixer) this.mixer.stopAllAction();
  },

  update: function(previousData) {
    if (!previousData) return;

    if (this.data.clip) {
      if (previousData.currentTime !== this.data.currentTime) {
        this.setTime(this.data.currentTime);
      }
    }
  },

  stopAction: function() {
    const data = this.data;
    for (let i = 0; i < this.activeActions.length; i++) {
      data.crossFadeDuration
        ? this.activeActions[i].fadeOut(data.crossFadeDuration)
        : this.activeActions[i].stop();
    }
    this.activeActions.length = 0;
  },

  playAction: function() {
    if (!this.mixer) return;

    const model = this.model,
      data = this.data,
      clips = model.animations || (model.geometry || {}).animations || [];

    if (!clips.length) return;

    const re = wildcardToRegExp(data.clip);

    for (let clip, i = 0; (clip = clips[i]); i++) {
      if (clip.name.match(re)) {
        const action = this.mixer.clipAction(clip, model);
        action.enabled = true;
        if (data.duration) action.setDuration(data.duration);
        action
          .setLoop(LoopMode[data.loop], data.repetitions)
          .fadeIn(data.crossFadeDuration)
          .play();
        this.activeActions.push(action);
        this.el.emit("clip-loaded", {clipDuration: clip.duration});
      }
    }
  },

  pauseAction: function() {
    if (!this.mixer) return;
    this.data.paused = true;
  },

  setTime: function(time) {
    if (!this.mixer) return;
    let previousTime = this.mixer.time;
    this.mixer.update(time - previousTime);
  },

  tick: function(t, dt) {
    if (this.mixer && !isNaN(dt) && !this.data.paused) {
      let tickAmount = this.data.speed * dt / 1000;
      this.mixer.update(tickAmount);
      this.el.emit("tick", {time: this.activeActions[0].time});
    }
  }
});

/**
 * Creates a RegExp from the given string, converting asterisks to .* expressions,
 * and escaping all other characters.
 */
function wildcardToRegExp(s) {
  return new RegExp(
    "^" +
      s
        .split(/\*+/)
        .map(regExpEscape)
        .join(".*") +
      "$"
  );
}

/**
 * RegExp-escapes all characters in the given string.
 */
function regExpEscape(s) {
  return s.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}
