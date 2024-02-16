import { OutputTargetCustom } from '@stencil/core/internal';
export declare function isObject(item: any): any;
export declare function mergeDeep(target: any, ...sources: any): any;
interface PatternLabOutputTarget extends OutputTargetCustom {
    patternlabConfig: any;
    patternLab: any;
}
export declare const patternLabOutputTarget: (outputTargetOptions: any) => PatternLabOutputTarget;
export {};
