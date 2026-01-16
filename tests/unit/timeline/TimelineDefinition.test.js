import { describe, it, expect, beforeEach } from "vitest";
import {
  TimelineDefinition,
  TimelineTrack,
} from "../../../src/timeline/TimelineDefinition.js";

describe("TimelineTrack", () => {
  let track;

  beforeEach(() => {
    track = new TimelineTrack("TestTrack", "float");
  });

  it("should initialize with correct name and type", () => {
    expect(track.name).toBe("TestTrack");
    expect(track.type).toBe("float");
    expect(track.keyframes).toHaveLength(0);
  });

  it("should add and sort keyframes by time", () => {
    track.addKeyframe(2.0, 10);
    track.addKeyframe(1.0, 5);
    track.addKeyframe(3.0, 15);

    expect(track.keyframes[0].time).toBe(1.0);
    expect(track.keyframes[1].time).toBe(2.0);
    expect(track.keyframes[2].time).toBe(3.0);
  });

  it("should evaluate linear interpolation for floats", () => {
    track.addKeyframe(0, 0, "linear");
    track.addKeyframe(10, 100, "linear");

    expect(track.evaluate(0)).toBe(0);
    expect(track.evaluate(5)).toBe(50);
    expect(track.evaluate(10)).toBe(100);
    expect(track.evaluate(-1)).toBe(0); // Clamp
    expect(track.evaluate(11)).toBe(100); // Clamp
  });

  it("should evaluate constant interpolation", () => {
    track.addKeyframe(0, 0, "constant");
    track.addKeyframe(5, 100, "constant");

    expect(track.evaluate(0)).toBe(0);
    expect(track.evaluate(4.9)).toBe(0);
    expect(track.evaluate(5)).toBe(100);
  });

  it("should evaluate smooth (cubic) interpolation", () => {
    track.addKeyframe(0, 0, "cubic");
    track.addKeyframe(1, 1, "cubic");

    // Cubic ease should be 0.5 at t=0.5
    expect(track.evaluate(0.5)).toBeCloseTo(0.5);
    // At t=0.25, linear is 0.25, but cubic should be smaller (starts slow)
    expect(track.evaluate(0.25)).toBeLessThan(0.25);
  });

  it("should interpolate vectors", () => {
    track = new TimelineTrack("VectorTrack", "vector");
    track.addKeyframe(0, { x: 0, y: 0, z: 0 });
    track.addKeyframe(1, { x: 10, y: 20, z: 30 });

    const mid = track.evaluate(0.5);
    expect(mid.x).toBe(5);
    expect(mid.y).toBe(10);
    expect(mid.z).toBe(15);
  });

  it("should interpolate colors", () => {
    track = new TimelineTrack("ColorTrack", "color");
    track.addKeyframe(0, { r: 0, g: 0, b: 0, a: 1 });
    track.addKeyframe(1, { r: 1, g: 1, b: 1, a: 0 });

    const mid = track.evaluate(0.5);
    expect(mid.r).toBe(0.5);
    expect(mid.g).toBe(0.5);
    expect(mid.b).toBe(0.5);
    expect(mid.a).toBe(0.5);
  });
});

describe("TimelineDefinition", () => {
  let tl;

  beforeEach(() => {
    tl = new TimelineDefinition("MyTimeline");
  });

  it("should add and manage tracks", () => {
    tl.addTrack("Alpha", "float");
    tl.addTrack("Offset", "vector");

    expect(tl.tracks).toHaveLength(2);
    expect(tl.getTrack("Alpha")).toBeDefined();
    expect(tl.getTrack("Alpha").type).toBe("float");

    tl.removeTrack(tl.tracks[0].id);
    expect(tl.tracks).toHaveLength(1);
    expect(tl.tracks[0].name).toBe("Offset");
  });

  it("should evaluate all tracks simultaneously", () => {
    const t1 = tl.addTrack("T1", "float");
    const t2 = tl.addTrack("T2", "float");

    t1.addKeyframe(0, 0);
    t1.addKeyframe(1, 10);
    t2.addKeyframe(0, 100);
    t2.addKeyframe(1, 0);

    const values = tl.evaluateAll(0.5);
    expect(values.T1).toBe(5);
    expect(values.T2).toBe(50);
  });

  it("should serialize and deserialize correctly", () => {
    tl.addTrack("T1", "float").addKeyframe(0, 10);
    tl.length = 10;
    tl.loop = true;

    const json = tl.toJSON();
    const tl2 = TimelineDefinition.fromJSON(json);

    expect(tl2.name).toBe(tl.name);
    expect(tl2.length).toBe(10);
    expect(tl2.loop).toBe(true);
    expect(tl2.tracks).toHaveLength(1);
    expect(tl2.tracks[0].keyframes[0].value).toBe(10);
  });
});
