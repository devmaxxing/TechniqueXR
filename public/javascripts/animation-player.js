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
    speed: { default: 1.0 }
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
    } else {
      this.el.addEventListener("model-loaded", e => {
        this.load(e.detail.model);
      });
    }
  },

  load: function(model) {
    const el = this.el;
    this.model = model;
    this.mixer = new THREE.AnimationMixer(model);
    this.mixer.addEventListener("loop", e => {
      el.emit("animation-loop", { action: e.action, loopDelta: e.loopDelta });
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

    this.stopAction();

    if (this.data.clip) {
      this.playAction();
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
      }
    }
  },

  tick: function(t, dt) {
    if (this.mixer && !isNaN(dt)) this.mixer.update(this.data.speed * dt / 1000);
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
