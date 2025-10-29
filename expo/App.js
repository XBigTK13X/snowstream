import * as Sentry from "@sentry/react-native";
Sentry.init({
    dsn: "https://e347f7f6238e44238666aef85b8a1b15@bugsink.9914.us/1",
    sendDefaultPii: true,
});

import PageLoader from './src/page/page-loader'

export default Sentry.wrap(PageLoader);