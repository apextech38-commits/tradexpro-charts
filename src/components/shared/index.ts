// Minimal barrel. The real components/shared/index.ts in tradexpro-botbuilder
// re-exports the entire shared UI/utils tree (836K+). appId.js only needs
// getSocketURL, so that's all this surfaces.
export { getSocketURL } from './utils/config/config';
