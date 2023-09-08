import { createContext } from "react";

import { ApiClient } from "./api-client";

export const ApiClientContext = createContext(new ApiClient());
