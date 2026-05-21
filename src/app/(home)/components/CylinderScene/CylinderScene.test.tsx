import { render } from "@testing-library/react";
import * as THREE from "three";
import CylinderScene from "./CylinderScene";

type DisposableMock = { dispose: jest.Mock };
type RendererMock = {
  setPixelRatio: jest.Mock;
  setSize: jest.Mock;
  render: jest.Mock;
  dispose: jest.Mock;
  domElement: HTMLCanvasElement;
};
type CameraMock = {
  args: [number, number, number, number];
  aspect: number;
  updateProjectionMatrix: jest.Mock;
};
type BufferAttributeMock = { array: Float32Array; itemSize: number };

type Registry = {
  disposables: DisposableMock[];
  renderers: RendererMock[];
  cameras: CameraMock[];
  bufferAttributes: BufferAttributeMock[];
};

jest.mock("three", () => {
  const disposables: DisposableMock[] = [];
  const renderers: RendererMock[] = [];
  const cameras: CameraMock[] = [];
  const bufferAttributes: BufferAttributeMock[] = [];

  const makeVec = () => ({ x: 0, y: 0, z: 0, set: jest.fn() });

  class Disposable {
    dispose = jest.fn();
    constructor() {
      disposables.push(this as unknown as DisposableMock);
    }
  }

  class WebGLRenderer {
    setPixelRatio = jest.fn();
    setSize = jest.fn();
    render = jest.fn();
    dispose = jest.fn();
    toneMapping = 0;
    toneMappingExposure = 0;
    outputColorSpace: unknown = "";
    shadowMap = { enabled: false, type: 0 };
    domElement: HTMLCanvasElement;
    constructor() {
      this.domElement = document.createElement("canvas");
      renderers.push(this as unknown as RendererMock);
    }
  }

  class Scene {
    children: unknown[] = [];
    add = (...objs: unknown[]) => {
      this.children.push(...objs);
    };
  }

  class PerspectiveCamera {
    aspect = 1;
    position = makeVec();
    updateProjectionMatrix = jest.fn();
    args: [number, number, number, number];
    constructor(fov: number, aspect: number, near: number, far: number) {
      this.aspect = aspect;
      this.args = [fov, aspect, near, far];
      cameras.push(this as unknown as CameraMock);
    }
  }

  class Color {
    constructor(public value: number) {}
  }

  class Material extends Disposable {
    constructor(public opts: Record<string, unknown> = {}) {
      super();
    }
  }
  class MeshPhysicalMaterial extends Material {}
  class MeshBasicMaterial extends Material {}
  class PointsMaterial extends Material {}

  class Geometry extends Disposable {
    args: unknown[];
    constructor(...args: unknown[]) {
      super();
      this.args = args;
    }
  }
  class CylinderGeometry extends Geometry {}
  class CircleGeometry extends Geometry {}
  class TorusGeometry extends Geometry {}
  class RingGeometry extends Geometry {}
  class BufferGeometry extends Geometry {
    setAttribute = jest.fn();
  }
  class BufferAttribute {
    constructor(public array: Float32Array, public itemSize: number) {
      bufferAttributes.push(this);
    }
  }

  class Object3D {
    position = makeVec();
    rotation = makeVec();
    renderOrder = 0;
    children: unknown[] = [];
    add = (...objs: unknown[]) => {
      this.children.push(...objs);
    };
  }
  class Mesh extends Object3D {
    constructor(public geometry: unknown, public material: unknown) {
      super();
    }
  }
  class Group extends Object3D {}
  class Points extends Object3D {
    constructor(public geometry: unknown, public material: unknown) {
      super();
    }
  }

  class AmbientLight {
    constructor(public color: number, public intensity: number) {}
  }
  class PointLight {
    position = makeVec();
    constructor(
      public color: number,
      public intensity: number,
      public distance: number,
    ) {}
  }
  class Clock {
    getElapsedTime = jest.fn().mockReturnValue(0);
  }

  const registry: Registry = {
    disposables,
    renderers,
    cameras,
    bufferAttributes,
  };

  return {
    __registry: registry,
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    Color,
    MeshPhysicalMaterial,
    MeshBasicMaterial,
    PointsMaterial,
    CylinderGeometry,
    CircleGeometry,
    TorusGeometry,
    RingGeometry,
    BufferGeometry,
    BufferAttribute,
    Mesh,
    Group,
    Points,
    AmbientLight,
    PointLight,
    Clock,
    ACESFilmicToneMapping: 1,
    SRGBColorSpace: "srgb",
    PCFSoftShadowMap: 2,
    PCFShadowMap: 1,
    FrontSide: 0,
    BackSide: 1,
    DoubleSide: 2,
  };
});

const registry = (THREE as unknown as { __registry: Registry }).__registry;

const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height,
  });
};

describe("CylinderScene", () => {
  let rafSpy: jest.SpyInstance;
  let cancelRafSpy: jest.SpyInstance;

  beforeEach(() => {
    registry.disposables.length = 0;
    registry.renderers.length = 0;
    registry.cameras.length = 0;
    registry.bufferAttributes.length = 0;
    rafSpy = jest
      .spyOn(window, "requestAnimationFrame")
      .mockReturnValue(123);
    cancelRafSpy = jest
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation(() => undefined);
    setViewport(1440, 900);
  });

  afterEach(() => {
    rafSpy.mockRestore();
    cancelRafSpy.mockRestore();
  });

  it("renders a fixed, aria-hidden mount div containing the renderer canvas", () => {
    const { container, unmount } = render(<CylinderScene />);

    const mount = container.firstElementChild as HTMLDivElement;
    expect(mount).not.toBeNull();
    expect(mount.getAttribute("aria-hidden")).toBe("true");
    expect(mount.style.position).toBe("fixed");
    expect(mount.style.inset).toBe("0");
    expect(mount.style.pointerEvents).toBe("none");
    expect(mount.querySelectorAll("canvas")).toHaveLength(1);

    unmount();
  });

  it("uses desktop camera and renderer size on wide viewports", () => {
    setViewport(1440, 900);
    const { unmount } = render(<CylinderScene />);

    expect(registry.renderers).toHaveLength(1);
    expect(registry.renderers[0].setSize).toHaveBeenCalledWith(1440, 900);

    expect(registry.cameras).toHaveLength(1);
    const [fov, aspect, near, far] = registry.cameras[0].args;
    expect(fov).toBe(42);
    expect(aspect).toBeCloseTo(1440 / 900);
    expect(near).toBe(0.1);
    expect(far).toBe(100);

    unmount();
  });

  it("uses mobile camera and fewer particles on narrow viewports", () => {
    setViewport(375, 812);
    const { unmount } = render(<CylinderScene />);

    expect(registry.cameras[0].args[0]).toBe(52);

    const positionAttr = registry.bufferAttributes.find(
      (attr) => attr.itemSize === 3 && attr.array.length === 150 * 3,
    );
    expect(positionAttr).toBeDefined();

    unmount();
  });

  it("registers and removes window listeners", () => {
    const addSpy = jest.spyOn(window, "addEventListener");
    const removeSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = render(<CylinderScene />);

    const added = addSpy.mock.calls.map(([type]) => type);
    expect(added).toEqual(
      expect.arrayContaining(["mousemove", "touchmove", "resize"]),
    );

    unmount();

    const removed = removeSpy.mock.calls.map(([type]) => type);
    expect(removed).toEqual(
      expect.arrayContaining(["mousemove", "touchmove", "resize"]),
    );

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("disposes renderer, geometries, and materials on unmount", () => {
    const { unmount } = render(<CylinderScene />);

    const renderer = registry.renderers[0];
    const captured = [...registry.disposables];
    expect(captured.length).toBeGreaterThanOrEqual(19);

    unmount();

    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    captured.forEach((d) => {
      expect(d.dispose).toHaveBeenCalled();
    });
    expect(cancelRafSpy).toHaveBeenCalledWith(123);
  });

  it("updates camera aspect and renderer size on window resize", () => {
    setViewport(1440, 900);
    const { unmount } = render(<CylinderScene />);

    const camera = registry.cameras[0];
    const renderer = registry.renderers[0];
    renderer.setSize.mockClear();
    camera.updateProjectionMatrix.mockClear();

    setViewport(800, 600);
    window.dispatchEvent(new Event("resize"));

    expect(camera.aspect).toBeCloseTo(800 / 600);
    expect(camera.updateProjectionMatrix).toHaveBeenCalledTimes(1);
    expect(renderer.setSize).toHaveBeenCalledWith(800, 600);

    unmount();
  });
});
