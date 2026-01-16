import { generateGUID } from "../utils/guid.js";

/**
 * TimelineTrack - A single track in a Timeline (Float, Vector, Event, Color)
 */
export class TimelineTrack {
  constructor(name, type = "float") {
    this.id = generateGUID();
    this.name = name;
    this.type = type; // 'float', 'vector', 'event', 'color'
    this.keyframes = [];
  }

  /**
   * Add a keyframe at specified time
   * @param {number} time - Time in seconds
   * @param {*} value - Value at this keyframe
   * @param {string} interpMode - 'linear', 'cubic', 'constant'
   */
  addKeyframe(time, value, interpMode = "linear") {
    const kf = {
      id: generateGUID(),
      time,
      value,
      interpMode,
      tangentIn: 0,
      tangentOut: 0,
    };
    this.keyframes.push(kf);
    this.keyframes.sort((a, b) => a.time - b.time);
    return kf;
  }

  /**
   * Remove keyframe by id
   */
  removeKeyframe(keyframeId) {
    const idx = this.keyframes.findIndex((k) => k.id === keyframeId);
    if (idx >= 0) {
      this.keyframes.splice(idx, 1);
    }
  }

  /**
   * Evaluate track value at time using interpolation
   */
  evaluate(time) {
    if (this.keyframes.length === 0) {
      return this.getDefaultValue();
    }

    if (this.keyframes.length === 1) {
      return this.keyframes[0].value;
    }

    // Find surrounding keyframes
    let prev = null;
    let next = null;

    for (let i = 0; i < this.keyframes.length; i++) {
      if (this.keyframes[i].time <= time) {
        prev = this.keyframes[i];
      }
      if (this.keyframes[i].time >= time && !next) {
        next = this.keyframes[i];
      }
    }

    // Clamp to bounds
    if (!prev) return this.keyframes[0].value;
    if (!next) return this.keyframes[this.keyframes.length - 1].value;
    if (prev === next) return prev.value;

    // Interpolate
    const t = (time - prev.time) / (next.time - prev.time);
    return this._interpolate(prev.value, next.value, t, prev.interpMode);
  }

  _interpolate(a, b, t, mode) {
    if (mode === "constant") {
      return a;
    }

    if (this.type === "float" || this.type === "event") {
      return a + (b - a) * this._ease(t, mode);
    }

    if (this.type === "vector") {
      return {
        x: a.x + (b.x - a.x) * this._ease(t, mode),
        y: a.y + (b.y - a.y) * this._ease(t, mode),
        z: a.z + (b.z - a.z) * this._ease(t, mode),
      };
    }

    if (this.type === "color") {
      return {
        r: a.r + (b.r - a.r) * this._ease(t, mode),
        g: a.g + (b.g - a.g) * this._ease(t, mode),
        b: a.b + (b.b - a.b) * this._ease(t, mode),
        a: a.a + (b.a - a.a) * this._ease(t, mode),
      };
    }

    return a;
  }

  _ease(t, mode) {
    if (mode === "cubic") {
      // Smooth step
      return t * t * (3 - 2 * t);
    }
    return t; // linear
  }

  getDefaultValue() {
    switch (this.type) {
      case "float":
        return 0;
      case "vector":
        return { x: 0, y: 0, z: 0 };
      case "color":
        return { r: 1, g: 1, b: 1, a: 1 };
      case "event":
        return 0;
      default:
        return 0;
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      keyframes: this.keyframes,
    };
  }

  static fromJSON(data) {
    const track = new TimelineTrack(data.name, data.type);
    track.id = data.id;
    track.keyframes = data.keyframes || [];
    return track;
  }
}

/**
 * TimelineDefinition - Complete timeline with multiple tracks
 */
export class TimelineDefinition {
  constructor(name = "NewTimeline") {
    this.id = generateGUID();
    this.name = name;
    this.length = 5.0; // Duration in seconds
    this.loop = false;
    this.autoPlay = false;
    this.tracks = [];
  }

  /**
   * Add a new track
   */
  addTrack(name, type = "float") {
    const track = new TimelineTrack(name, type);
    this.tracks.push(track);
    return track;
  }

  /**
   * Get track by name
   */
  getTrack(name) {
    return this.tracks.find((t) => t.name === name);
  }

  /**
   * Remove track by id
   */
  removeTrack(trackId) {
    const idx = this.tracks.findIndex((t) => t.id === trackId);
    if (idx >= 0) {
      this.tracks.splice(idx, 1);
    }
  }

  /**
   * Evaluate all tracks at time
   * @returns {Object} Map of track name -> value
   */
  evaluateAll(time) {
    const result = {};
    for (const track of this.tracks) {
      result[track.name] = track.evaluate(time);
    }
    return result;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      length: this.length,
      loop: this.loop,
      autoPlay: this.autoPlay,
      tracks: this.tracks.map((t) => t.toJSON()),
    };
  }

  static fromJSON(data) {
    const tl = new TimelineDefinition(data.name);
    tl.id = data.id;
    tl.length = data.length || 5.0;
    tl.loop = data.loop || false;
    tl.autoPlay = data.autoPlay || false;
    tl.tracks = (data.tracks || []).map((t) => TimelineTrack.fromJSON(t));
    return tl;
  }
}
