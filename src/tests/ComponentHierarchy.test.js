
import { Utils } from '../utils.js';

export function registerComponentHierarchyTests(testRunner) {
    testRunner.addTest('Component Hierarchy: Exact Match', () => {
        if (!Utils.isTypeCompatible('SceneComponent', 'SceneComponent')) {
            throw new Error('Exact match failed');
        }
        return true;
    });

    testRunner.addTest('Component Hierarchy: StaticMesh -> SceneComponent', () => {
        // StaticMeshComponent -> MeshComponent -> PrimitiveComponent -> SceneComponent
        if (!Utils.isTypeCompatible('StaticMeshComponent', 'SceneComponent')) {
            throw new Error('StaticMeshComponent should be compatible with SceneComponent');
        }
        return true;
    });

    testRunner.addTest('Component Hierarchy: PointLight -> SceneComponent', () => {
        // PointLightComponent -> LightComponent -> SceneComponent
        if (!Utils.isTypeCompatible('PointLightComponent', 'SceneComponent')) {
            throw new Error('PointLightComponent should be compatible with SceneComponent');
        }
        return true;
    });

    testRunner.addTest('Component Hierarchy: Box -> PrimitiveComponent', () => {
        // BoxComponent -> ShapeComponent -> PrimitiveComponent
        if (!Utils.isTypeCompatible('BoxComponent', 'PrimitiveComponent')) {
            throw new Error('BoxComponent should be compatible with PrimitiveComponent');
        }
        return true;
    });

    testRunner.addTest('Component Hierarchy: Any Component -> Object', () => {
        if (!Utils.isTypeCompatible('CameraComponent', 'Object')) {
            throw new Error('CameraComponent should be compatible with Object');
        }
        return true;
    });

    testRunner.addTest('Component Hierarchy: Incompatible Types', () => {
        if (Utils.isTypeCompatible('SceneComponent', 'StaticMeshComponent')) {
            throw new Error('Parent should not be compatible with Child (Scene -> StaticMesh)');
        }
        if (Utils.isTypeCompatible('PointLightComponent', 'StaticMeshComponent')) {
            throw new Error('Siblings should not be compatible (PointLight -> StaticMesh)');
        }
        return true;
    });
}
