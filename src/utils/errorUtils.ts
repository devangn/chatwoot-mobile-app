import { Alert } from 'react-native';

import i18n from '../i18n';

interface ErrorHandler {
  (e: Error, isFatal: boolean): void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorHandler = (e, isFatal) => {
  console.error('[ErrorHandler]', e);
  if (isFatal) {
    Alert.alert(
      i18n.t('COMMON.ERROR_TITLE'),
      `${i18n.t('COMMON.ERROR')}: ${isFatal ? 'Fatal:' : ''} ${e.name} ${e.message}${i18n.t(
        'COMMON.REPORT_MESSAGE',
      )}`,
      [
        {
          text: i18n.t('COMMON.CLOSE'),
        },
      ],
    );
  } else {
    // eslint-disable-next-line no-console
    console.log(e);
  }
};

export default {
  init(): void {
    // setNativeExceptionHandler(exceptionString => {
    //   console.error('[NativeExceptionHandler]', exceptionString);
    // }, false);
    // setJSExceptionHandler(errorHandler, false);
  },
};
