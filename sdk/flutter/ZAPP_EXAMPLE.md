# Zapp.run Example for Tenlixor Flutter SDK

This example demonstrates how to use the Tenlixor Flutter SDK on [Zapp.run](https://zapp.run/).

## 🔗 Try it on Zapp.run

✅ **Package is now compatible with Zapp.run!**

**Link**: [Open in Zapp.run](https://zapp.run/edit/tenlixor-example) *(Create your own project)*

## 📋 How to Use on Zapp.run

### 1. Open Zapp.run
Go to https://zapp.run/

### 2. Add Dependencies
In the `pubspec.yaml` editor, add:

```yaml
dependencies:
  flutter:
    sdk: flutter
  tenlixor: ^1.0.4
```

### 3. Copy the Example Code

Replace the content of `main.dart` with the code below:

```dart
import 'package:flutter/material.dart';
import 'package:tenlixor/tenlixor.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tenlixor Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const TenlixorDemo(),
    );
  }
}

class TenlixorDemo extends StatefulWidget {
  const TenlixorDemo({super.key});

  @override
  State<TenlixorDemo> createState() => _TenlixorDemoState();
}

class _TenlixorDemoState extends State<TenlixorDemo> {
  late final Tenlixor txr;

  @override
  void initState() {
    super.initState();
    
    // Initialize Tenlixor
    txr = Tenlixor(
      config: const TenlixorConfig(
        token: 'YOUR_API_TOKEN', // ⚠️ Replace with your token
        tenantSlug: 'YOUR_TENANT', // ⚠️ Replace with your tenant
        language: 'en',
        persistentStorage: true,
      ),
    );

    // Listen to state changes
    txr.addListener(() {
      if (mounted) setState(() {});
    });

    // Initialize
    txr.init();
  }

  @override
  void dispose() {
    txr.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: const Text('Tenlixor Flutter Demo'),
      ),
      body: Center(
        child: txr.isReady ? _buildContent() : _buildLoading(),
      ),
    );
  }

  Widget _buildLoading() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: const [
        CircularProgressIndicator(),
        SizedBox(height: 16),
        Text('Loading translations...'),
      ],
    );
  }

  Widget _buildContent() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Title
          Text(
            txr.t('app.welcome'),
            style: Theme.of(context).textTheme.headlineLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          
          // Description
          Text(
            txr.t('app.description'),
            style: Theme.of(context).textTheme.bodyLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 40),
          
          // Current Language
          Card(
            child: ListTile(
              leading: const Icon(Icons.language),
              title: const Text('Current Language'),
              trailing: Chip(
                label: Text(txr.language.toUpperCase()),
              ),
            ),
          ),
          const SizedBox(height: 16),
          
          // Language Buttons
          Text(
            'Switch Language:',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: txr.availableLanguages.map((lang) {
              final isActive = lang == txr.language;
              return ElevatedButton(
                onPressed: txr.isLoading || isActive
                    ? null
                    : () => txr.setLanguage(lang),
                child: Text(lang.toUpperCase()),
              );
            }).toList(),
          ),
          
          if (txr.isLoading) ...[
            const SizedBox(height: 20),
            const LinearProgressIndicator(),
          ],
        ],
      ),
    );
  }
}
```

### 4. Run the App

Click the **Run** button in Zapp.run to see your app in action!

## 🔑 Configuration

**Important**: Replace these values with your actual Tenlixor credentials:

- `token`: Your API token from Tenlixor dashboard
- `tenantSlug`: Your tenant identifier

## ✨ Features Demonstrated

- ✅ SDK initialization
- ✅ Translation retrieval
- ✅ Language switching
- ✅ State management with ChangeNotifier
- ✅ Loading states
- ✅ Persistent storage (SharedPreferences)

## 📱 Test on Real Device

Zapp.run provides options to:
- Preview on iOS simulator
- Preview on Android emulator  
- Scan QR code to test on your phone

## 🐛 Troubleshooting

### Package Not Found

If you see "Package 'tenlixor' not found", it means:
- The package hasn't been published to pub.dev yet
- Wait a few minutes after publishing for pub.dev to propagate

### API Errors

Check that:
- Your API token is correct
- Your tenant slug is correct
- You have an active internet connection

## 📚 Learn More

- [Tenlixor Documentation](https://tenlixor.verbytes.com)
- [Flutter SDK README](../README.md)
- [GitHub Repository](https://github.com/bbesli/Tenlixor-SDK)

---

**Made with ❤️ by Verbytes**
