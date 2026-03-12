/// Tenlixor Flutter SDK
/// 
/// A Flutter SDK for Tenlixor localization platform with SharedPreferences support.
/// 
/// ## Usage
/// 
/// ```dart
/// import 'package:tenlixor/tenlixor.dart';
/// 
/// final txr = Tenlixor(
///   config: TenlixorConfig(
///     token: 'YOUR_API_TOKEN',
///     tenantSlug: 'your-tenant-slug',
///     language: 'en',
///     persistentStorage: true,
///   ),
/// );
/// 
/// await txr.init();
/// print(txr.t('app.welcome'));
/// ```
library tenlixor;

export 'src/tenlixor_client.dart';
export 'src/types.dart';
export 'src/storage_adapter.dart';
