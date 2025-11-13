import Constants from "expo-constants";
import * as Sentry from "@sentry/react-native";
import pkg from "./package.json";

const release = `snowstream@${pkg.version}`;
const dist = `${Constants.manifest?.android?.versionCode ?? 1}`;

Sentry.init({
    dsn: "https://e347f7f6238e44238666aef85b8a1b15@bugsink.9914.us/1",
    release,
    dist,
    sendDefaultPii: true,
});

import PageLoader from "./src/page/page-loader";

export default Sentry.wrap(PageLoader);
