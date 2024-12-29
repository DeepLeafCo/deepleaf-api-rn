# DeepLeaf API React Native Integration Guide

This guide will help you integrate the DeepLeaf API into your React Native application for plant health anomalies detection and analysis.

## Installation

1. Install the DeepLeaf API package:

```bash
npm install deepleaf-api-rn
# or using yarn
yarn add deepleaf-api-rn
```

2. Install required dependencies for image handling:

```bash
npm install react-native-image-picker
# or using yarn
yarn add react-native-image-picker
```

3. Install other dependencies by running:

```bash
npm i
# or using yarn
yarn install
```

## Configuration

### API Setup

If you don’t have your API key yet, you can obtain it by registering at [deepleaf.io/products/api/register](https://deepleaf.io/products/api/register) or by contacting us directly at **hello@deepleaf.io** if the registration page is unavailable.

Initialize the DeepLeaf API client in your app:

```typescript
import { DeepLeafAPI } from 'deepleaf-api-rn';

const api = new DeepLeafAPI({
  apiKey: 'YOUR_API_KEY_HERE',
  language: 'en', // or your preferred language code
});
```

You can manage the language setting dynamically using:

- i18next for internationalization
- AsyncStorage for local storage
- MMKV for high-performance storage
- Or any other state management solution

Example with AsyncStorage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize API with stored language
const initializeAPI = async () => {
  const storedLanguage = (await AsyncStorage.getItem('userLanguage')) || 'en';
  const api = new DeepLeafAPI({
    apiKey: 'YOUR_API_KEY_HERE',
    language: storedLanguage,
  });
};
```

### Android Permissions

If your app uses camera capture and/or location features, add these permissions to your `android/app/src/main/AndroidManifest.xml` file:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Required permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- ... rest of your manifest file ... -->
</manifest>
```

## Usage

Check the example app in this repository for a complete implementation. The example demonstrates:

- Image selection from gallery
- Image analysis using DeepLeaf API
- Displaying analysis results
- Handling loading states and errors

## Important Notes

1. Keep your API key secure and never commit it directly in your code (using .env for example)
2. Handle permissions requests appropriately for camera and location access
3. Implement proper error handling for API responses
4. Consider implementing caching for analysis results if needed

## Support

For additional help or issues:

- Visit the DeepLeaf API documentation [deepleaf.io/products/api/documentation](https://deepleaf.io/products/api/documentation)
- Submit issues on the repository
- Contact DeepLeaf support team [deepleaf.io/products/api/support](https://deepleaf.io/products/api/support)

## Licenses

### DeepLeaf Example App License

The example app is open-source under the **MIT License**:

```
MIT License

Copyright (c) [2025] DeepLeaf, Co.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

---

### DeepLeaf AI and API License

The DeepLeaf AI and API are proprietary to DeepLeaf, Co., and users must comply with the **DeepLeaf AI and API License Agreement**:

```
Copyright © [2025] DeepLeaf, Co. All rights reserved.

1. Grant of License:
   You are granted a non-exclusive, revocable license to use the DeepLeaf API solely as described in the official documentation and in compliance with these terms.

2. Restrictions:
   - You may not reverse engineer, decompile, or attempt to derive the source code of DeepLeaf AI or API.
   - You may not sublicense, sell, or distribute access to the API.

3. Ownership:
   All rights, title, and interest in the DeepLeaf AI and API, including any updates or modifications, remain the sole property of DeepLeaf, Co.

4. Termination:
   DeepLeaf, Co. reserves the right to terminate this license at any time if the terms are violated.
```

For inquiries or questions regarding the DeepLeaf AI and API, please contact us at **hello@deepleaf.io**.
