const { withDangerousMod, createRunOncePlugin } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withDocumentPickerFix(config) {
  return withDangerousMod(config, [
    'android',
    async config => {
      const modulePath = path.join(
        config.modRequest.platformProjectRoot,
        '..',
        'node_modules',
        'react-native-document-picker',
        'android',
        'src',
        'main',
        'java',
        'com',
        'reactnativedocumentpicker',
        'RNDocumentPickerModule.java'
      );

      try {
        if (fs.existsSync(modulePath)) {
          let content = await fs.promises.readFile(modulePath, 'utf8');
          
          // Remove GuardedResultAsyncTask import
          content = content.replace(
            /import com\.facebook\.react\.bridge\.GuardedResultAsyncTask;\n/g,
            ''
          );
          
          // Replace GuardedResultAsyncTask with a simple Runnable-based approach
          // First, replace the class definition
          content = content.replace(
            /private static class ProcessDataTask extends GuardedResultAsyncTask<ReadableArray> \{/g,
            'private static class ProcessDataTask implements Runnable {\n    private final ReactApplicationContext reactContext;\n    private final ReadableArray uris;\n    private final String copyTo;\n    private final Promise promise;\n    private ReadableArray result;\n    \n    ProcessDataTask(ReactApplicationContext reactContext, ReadableArray uris, String copyTo, Promise promise) {\n      this.reactContext = reactContext;\n      this.uris = uris;\n      this.copyTo = copyTo;\n      this.promise = promise;\n    }\n    \n    @Override\n    public void run() {'
          );
          
          // Update doInBackground to be a regular method
          content = content.replace(
            /@Override\s+protected ReadableArray doInBackground\(\) \{/g,
            'ReadableArray doInBackground() {'
          );
          
          // Update onPostExecute to handle result
          content = content.replace(
            /@Override\s+protected void onPostExecute\(ReadableArray result\) \{/g,
            'void onPostExecute(ReadableArray result) {'
          );
          
          // Add the run method implementation
          content = content.replace(
            /(\s+void onPostExecute\(ReadableArray result\) \{[\s\S]*?\n\s+\})/,
            (match) => {
              return match + '\n      result = doInBackground();\n      if (result != null) {\n        reactContext.runOnUiQueueThread(() -> onPostExecute(result));\n      } else {\n        reactContext.runOnUiQueueThread(() -> promise.reject("ERROR", "Failed to process files"));\n      }\n    }'
            }
          );
          
          // Update execute call to use a thread
          content = content.replace(
            /new ProcessDataTask\(getReactApplicationContext\(\), uris, copyTo, promise\)\.execute\(\);/g,
            'new Thread(new ProcessDataTask(getReactApplicationContext(), uris, copyTo, promise)).start();'
          );
          
          await fs.promises.writeFile(modulePath, content, 'utf8');
        }
      } catch (error) {
        console.warn('Could not patch react-native-document-picker:', error.message);
      }
      
      return config;
    },
  ]);
}

module.exports = createRunOncePlugin(withDocumentPickerFix, 'with-document-picker-fix', '1.0.0');

