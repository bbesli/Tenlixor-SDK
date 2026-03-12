# Publishing Flutter SDK to pub.dev

This guide explains how to publish the Tenlixor Flutter SDK to pub.dev.

## Prerequisites

### 1. Install Flutter

#### Windows
```powershell
# Option 1: Using Chocolatey
choco install flutter

# Option 2: Manual Installation
# 1. Download: https://docs.flutter.dev/get-started/install/windows
# 2. Extract to C:\src\flutter
# 3. Add to PATH: C:\src\flutter\bin
```

#### macOS
```bash
# Using Homebrew
brew install flutter
```

#### Linux
```bash
# Download and extract Flutter
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"
```

### 2. Verify Installation

```bash
flutter --version
flutter doctor
```

### 3. Setup pub.dev Account

1. Go to https://pub.dev/
2. Sign in with Google account
3. Verify your email
4. Accept the terms

## Publishing Steps

### Step 1: Navigate to Flutter SDK Directory

```bash
cd D:\Development_Projects\Tenlixor-SDK\sdk\flutter
```

### Step 2: Verify Package

```bash
# Check package structure
flutter pub get

# Analyze code
flutter analyze

# Check publish readiness
flutter pub publish --dry-run
```

### Step 3: Fix Any Issues

If `pub publish --dry-run` finds issues, fix them before proceeding.

Common issues:
- Missing description in pubspec.yaml ✅ (Already added)
- Missing homepage/repository ✅ (Already added)
- Missing LICENSE ✅ (Already added)
- Missing CHANGELOG.md ✅ (Already added)
- Missing example/ ✅ (Already added)

### Step 4: Publish

```bash
flutter pub publish
```

You'll be asked to:
1. Confirm the package details
2. Authenticate with your Google account
3. Grant pub.dev access

### Step 5: Verify Publication

After publishing, verify at:
- Package page: https://pub.dev/packages/tenlixor
- Your packages: https://pub.dev/publishers

## Post-Publishing

### 1. Update README

Update the main README.md to reflect the published package:

```markdown
[📦 pub.dev](https://pub.dev/packages/tenlixor)
```

### 2. Create Git Tag

```bash
cd D:\Development_Projects\Tenlixor-SDK
git tag -a v1.0.0-flutter -m "Flutter SDK v1.0.0"
git push origin v1.0.0-flutter
```

### 3. Test on Zapp.run

1. Go to https://zapp.run/
2. Create new project
3. Add dependency in pubspec.yaml:
   ```yaml
   dependencies:
     tenlixor: ^1.0.0
   ```
4. Use the example code from ZAPP_EXAMPLE.md

## Updating the Package

### For Bug Fixes (Patch Version: 1.0.0 → 1.0.1)

1. Make your changes
2. Update version in `pubspec.yaml`:
   ```yaml
   version: 1.0.1
   ```
3. Update CHANGELOG.md
4. Run `flutter pub publish`

### For New Features (Minor Version: 1.0.0 → 1.1.0)

1. Make your changes
2. Update version in `pubspec.yaml`:
   ```yaml
   version: 1.1.0
   ```
3. Update CHANGELOG.md
4. Update README.md with new features
5. Run `flutter pub publish`

### For Breaking Changes (Major Version: 1.0.0 → 2.0.0)

1. Make your changes
2. Update version in `pubspec.yaml`:
   ```yaml
   version: 2.0.0
   ```
3. Update CHANGELOG.md with migration guide
4. Update README.md
5. Run `flutter pub publish`

## Troubleshooting

### "flutter: command not found"

Flutter is not in your PATH. Add it:

**Windows PowerShell**:
```powershell
$env:PATH += ";C:\src\flutter\bin"
# Or add permanently via System Environment Variables
```

**macOS/Linux**:
```bash
export PATH="$PATH:/path/to/flutter/bin"
# Add to ~/.bashrc or ~/.zshrc for permanent
```

### "Please make sure you are authenticated"

Run:
```bash
flutter pub login
```

### "Package validation failed"

Check the output carefully and fix all issues. Common problems:
- Incorrect version format
- Missing required fields
- Code analysis warnings

### "Package already exists"

You can't publish if:
- Package name is taken (choose different name)
- Version already published (increment version)

## Package Maintenance

### Monitor Package Health

Check regularly:
- pub.dev package score
- GitHub issues
- Dependency updates
- Flutter version compatibility

### Respond to Issues

- Monitor GitHub issues
- Respond to pub.dev comments
- Update documentation as needed

## Links

- **pub.dev**: https://pub.dev/
- **Flutter Docs**: https://docs.flutter.dev/
- **Publishing Guide**: https://dart.dev/tools/pub/publishing
- **Package Layout**: https://dart.dev/tools/pub/package-layout

---

**Ready to publish?**

```bash
cd D:\Development_Projects\Tenlixor-SDK\sdk\flutter
flutter pub publish
```

Good luck! 🚀
