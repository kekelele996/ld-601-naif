import { seed } from "../seed"; export const assistanceRequestRepository = { findAll: () => seed.assistanceRequest, save: (row: unknown) => row };
