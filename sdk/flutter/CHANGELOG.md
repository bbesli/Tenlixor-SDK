# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-03-12

### Fixed
- Changed `http` dependency from `^1.1.0` to `^0.13.0` for Dart 2.19+ compatibility
- Changed `shared_preferences` dependency from `^2.2.0` to `^2.0.0`
- Now fully compatible with Zapp.run and older Dart/Flutter versions

## [1.0.1] - 2026-03-12

### Fixed
- Lowered Dart SDK requirement from `>=3.0.0` to `>=2.17.0` for better compatibility
- Now compatible with Zapp.run and older Dart/Flutter versions

## [1.0.0] - 2026-03-12

### Added
- Initial release of Flutter SDK
- SharedPreferences support for persistent storage
- ChangeNotifier integration for state management
- Event stream for SDK events (loaded, languageChanged, error)
- Automatic cache management with configurable TTL
- Offline support with storage fallback
- Full type safety with Dart
- Support for multiple languages
- Fallback language support
- Background data refresh
- iOS and Android support

### Features
- `Tenlixor` class with ChangeNotifier for state management
- `t()` method for translations
- `setLanguage()` for language switching
- `init()` for SDK initialization
- `reload()` for refreshing translations
- `clearStorage()` for cache management
- Event stream for monitoring SDK events
- SharedPreferences adapter for persistent storage
- Configurable cache TTL and storage keys
