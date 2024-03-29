import Unisat_provider from "./unisat_provider";

// @ts-ignore
window.bitcoin = {
    Provider: Unisat_provider,
    postMessage: null
}

// Object.defineProperty(window, 'bitcoin', {
//     value: {
//         Provider: Unisat_provider
//     }
// })
