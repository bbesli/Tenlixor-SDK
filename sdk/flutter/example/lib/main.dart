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
      title: 'Tenlixor Flutter Example',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const TenlixorExample(),
    );
  }
}

class TenlixorExample extends StatefulWidget {
  const TenlixorExample({super.key});

  @override
  State<TenlixorExample> createState() => _TenlixorExampleState();
}

class _TenlixorExampleState extends State<TenlixorExample> {
  late final Tenlixor txr;
  final List<String> _eventLogs = [];

  @override
  void initState() {
    super.initState();
    
    // Initialize Tenlixor SDK
    txr = Tenlixor(
      config: const TenlixorConfig(
        token: 'YOUR_API_TOKEN', // Replace with your token
        tenantSlug: 'YOUR_TENANT_SLUG', // Replace with your tenant slug
        language: 'en',
        persistentStorage: true,
        fallbackLanguage: 'en',
        cacheTTL: 300000, // 5 minutes
      ),
    );

    // Listen to SDK events
    txr.events.listen((event) {
      setState(() {
        _eventLogs.add('${event.type.name}: ${event.data}');
      });
    });

    // Add listener for state changes
    txr.addListener(_onTenlixorUpdate);

    // Initialize SDK
    _initTenlixor();
  }

  Future<void> _initTenlixor() async {
    try {
      await txr.init();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Initialization error: $e')),
        );
      }
    }
  }

  void _onTenlixorUpdate() {
    setState(() {});
  }

  @override
  void dispose() {
    txr.removeListener(_onTenlixorUpdate);
    txr.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: const Text('Tenlixor Flutter Example'),
      ),
      body: txr.isReady
          ? _buildContent()
          : Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text(
                    'Loading Tenlixor SDK...',
                    style: TextStyle(fontSize: 16),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Translation examples
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    txr.t('app.welcome'),
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    txr.t('app.description'),
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // SDK status
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'SDK Status',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),
                  _buildStatusRow('Ready', txr.isReady ? '✓' : '✗'),
                  _buildStatusRow('Loading', txr.isLoading ? 'Yes' : 'No'),
                  _buildStatusRow('Current Language', txr.language.toUpperCase()),
                  _buildStatusRow(
                    'Available Languages',
                    txr.availableLanguages.join(', ').toUpperCase(),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Language switcher
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Switch Language',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    children: txr.availableLanguages.map((lang) {
                      final isSelected = lang == txr.language;
                      return ChoiceChip(
                        label: Text(lang.toUpperCase()),
                        selected: isSelected,
                        onSelected: txr.isLoading
                            ? null
                            : (selected) {
                                if (selected) {
                                  txr.setLanguage(lang);
                                }
                              },
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Actions
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Actions',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      ElevatedButton.icon(
                        onPressed: txr.isLoading
                            ? null
                            : () async {
                                await txr.reload();
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Translations reloaded'),
                                    ),
                                  );
                                }
                              },
                        icon: const Icon(Icons.refresh),
                        label: const Text('Reload'),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton.icon(
                        onPressed: txr.isLoading
                            ? null
                            : () async {
                                await txr.clearStorage();
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Cache cleared'),
                                    ),
                                  );
                                }
                              },
                        icon: const Icon(Icons.delete),
                        label: const Text('Clear Cache'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Event logs
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Event Logs',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      TextButton(
                        onPressed: () {
                          setState(() {
                            _eventLogs.clear();
                          });
                        },
                        child: const Text('Clear'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Container(
                    constraints: const BoxConstraints(maxHeight: 200),
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: _eventLogs.length,
                      itemBuilder: (context, index) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Text(
                            '${_eventLogs.length - index}. ${_eventLogs[_eventLogs.length - 1 - index]}',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  fontFamily: 'monospace',
                                ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
          Text(value, style: const TextStyle(color: Colors.blue)),
        ],
      ),
    );
  }
}
