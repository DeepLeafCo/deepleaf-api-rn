import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'deepleaf-api-rn' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const DeepleafApiRn = NativeModules.DeepleafApiRn
  ? NativeModules.DeepleafApiRn
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return DeepleafApiRn.multiply(a, b);
}
