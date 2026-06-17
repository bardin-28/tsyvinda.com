import { render } from "@testing-library/react";
import OloidScene from "./OloidScene";

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
  position: { z: number };
  updateProjectionMatrix: jest.Mock;
};

type Registry = {
  disposables: DisposableMock[];
  renderers: RendererMock[];
  cameras: CameraMock[];
};

// Shared registry on globalThis so both the `three` mock and the
// `ConvexGeometry` mock (separate factories) push into the same store.
const getRegistry = (): Registry => {
  const g = globalThis as unknown as { __oloidRegistry?: Registry };
  g.__oloidRegistry ??= { disposables: [], renderers: [], cameras: [] };
  return g.__oloidRegistry;
};

jest.mock("three", () => {
  const reg = (() => {
    const g = globalThis as unknown as { __oloidRegistry?: Registry };
    g.__oloidRegistry ??= { disposables: [], renderers: [], cameras: [] };
    return g.__oloidRegistry;
  })();

  const makeVec = () => ({ x: 0, y: 0, z: 0, set: jest.fn(), setScalar: jest.fn() });

  class Disposable {
    dispose = jest.fn();
    constructor() {
      reg.disposables.push(this as unknown as DisposableMock);
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
    domElement: HTMLCanvasElement;
    constructor() {
      this.domElement = document.createElement("canvas");
      reg.renderers.push(this as unknown as RendererMock);
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
    position = { z: 0 };
    updateProjectionMatrix = jest.fn();
    args: [number, number, number, number];
    constructor(fov: number, aspect: number, near: number, far: number) {
      this.aspect = aspect;
      this.args = [fov, aspect, near, far];
      reg.cameras.push(this as unknown as CameraMock);
    }
  }

  class Vector3 {
    constructor(public x = 0, public y = 0, public z = 0) {}
  }
  class Color {
    r = 0;
    g = 0;
    b = 0;
    constructor(public value: number) {}
  }

  class Material extends Disposable {
    constructor(public opts: Record<string, unknown> = {}) {
      super();
    }
  }
  class MeshPhysicalMaterial extends Material {}
  class LineBasicMaterial extends Material {}
  class PointsMaterial extends Material {}

  class Geometry extends Disposable {
    args: unknown[];
    computeVertexNormals = jest.fn();
    constructor(...args: unknown[]) {
      super();
      this.args = args;
    }
  }
  class EdgesGeometry extends Geometry {}
  class BufferGeometry extends Geometry {
    setAttribute = jest.fn();
  }
  class BufferAttribute {
    constructor(public array: Float32Array, public itemSize: number) {}
  }

  class Object3D {
    position = makeVec();
    rotation = makeVec();
    scale = makeVec();
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
  class LineSegments extends Object3D {
    constructor(public geometry: unknown, public material: unknown) {
      super();
    }
  }
  class Points extends Object3D {
    constructor(public geometry: unknown, public material: unknown) {
      super();
    }
  }
  class Group extends Object3D {}

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
  class Timer {
    update = jest.fn();
    getElapsed = jest.fn().mockReturnValue(0);
  }

  return {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    Vector3,
    Color,
    MeshPhysicalMaterial,
    LineBasicMaterial,
    PointsMaterial,
    EdgesGeometry,
    BufferGeometry,
    BufferAttribute,
    Mesh,
    LineSegments,
    Points,
    Group,
    AmbientLight,
    PointLight,
    Timer,
    ACESFilmicToneMapping: 1,
    SRGBColorSpace: "srgb",
    DoubleSide: 2,
  };
});

jest.mock("three/examples/jsm/geometries/ConvexGeometry.js", () => {
  const reg = (() => {
    const g = globalThis as unknown as { __oloidRegistry?: Registry };
    g.__oloidRegistry ??= { disposables: [], renderers: [], cameras: [] };
    return g.__oloidRegistry;
  })();
  class ConvexGeometry {
    dispose = jest.fn();
    computeVertexNormals = jest.fn();
    constructor(public points: unknown[]) {
      reg.disposables.push(this as unknown as DisposableMock);
    }
  }
  return { ConvexGeometry };
});

const registry = getRegistry();

const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
};

describe("OloidScene", () => {
  let rafSpy: jest.SpyInstance;
  let cancelRafSpy: jest.SpyInstance;

  beforeEach(() => {
    registry.disposables.length = 0;
    registry.renderers.length = 0;
    registry.cameras.length = 0;
    rafSpy = jest.spyOn(window, "requestAnimationFrame").mockReturnValue(123);
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
    const { container, unmount } = render(<OloidScene />);

    const mount = container.firstElementChild as HTMLDivElement;
    expect(mount).not.toBeNull();
    expect(mount.getAttribute("aria-hidden")).toBe("true");
    expect(mount.style.position).toBe("fixed");
    expect(mount.style.pointerEvents).toBe("none");
    expect(mount.querySelectorAll("canvas")).toHaveLength(1);

    unmount();
  });

  it("uses desktop camera and renderer size on wide viewports", () => {
    setViewport(1440, 900);
    const { unmount } = render(<OloidScene />);

    expect(registry.renderers[0].setSize).toHaveBeenCalledWith(1440, 900);
    const [fov, aspect, near, far] = registry.cameras[0].args;
    expect(fov).toBe(42);
    expect(aspect).toBeCloseTo(1440 / 900);
    expect(near).toBe(0.1);
    expect(far).toBe(100);

    unmount();
  });

  it("uses mobile camera on narrow viewports", () => {
    setViewport(375, 812);
    const { unmount } = render(<OloidScene />);

    expect(registry.cameras[0].args[0]).toBe(52);

    unmount();
  });

  it("registers and removes window listeners", () => {
    const addSpy = jest.spyOn(window, "addEventListener");
    const removeSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = render(<OloidScene />);
    const added = addSpy.mock.calls.map(([type]) => type);
    expect(added).toEqual(expect.arrayContaining(["mousemove", "touchmove", "resize"]));

    unmount();
    const removed = removeSpy.mock.calls.map(([type]) => type);
    expect(removed).toEqual(expect.arrayContaining(["mousemove", "touchmove", "resize"]));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("disposes renderer, geometries, and materials on unmount", () => {
    const { unmount } = render(<OloidScene />);

    const renderer = registry.renderers[0];
    const captured = [...registry.disposables];
    // oloid hull + edges + particle geometries (3) and 3 materials.
    expect(captured.length).toBeGreaterThanOrEqual(6);

    unmount();

    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    captured.forEach((d) => expect(d.dispose).toHaveBeenCalled());
    expect(cancelRafSpy).toHaveBeenCalledWith(123);
  });

  it("updates camera aspect and renderer size on window resize", () => {
    setViewport(1440, 900);
    const { unmount } = render(<OloidScene />);

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
