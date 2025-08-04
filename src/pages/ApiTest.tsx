import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import testApiService from '@/lib/test-api';

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  data?: any;
  message: string;
  timestamp: string;
}

const ApiTestPage = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (result: Omit<TestResult, 'timestamp'>) => {
    setTestResults(prev => [
      ...prev,
      { ...result, timestamp: new Date().toLocaleTimeString() }
    ]);
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    addTestResult({
      endpoint: testName,
      status: 'loading',
      message: 'Test en cours...'
    });

    try {
      const result = await testFn();
      addTestResult({
        endpoint: testName,
        status: 'success',
        data: result,
        message: `✅ Test réussi - ${JSON.stringify(result).length} caractères de données`
      });
    } catch (error: any) {
      addTestResult({
        endpoint: testName,
        status: 'error',
        message: `❌ Erreur: ${error.message}`
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Santé de l'API
    await runTest('GET /api/health', () => testApiService.health.check());

    // Test 2: Spécialistes
    await runTest('GET /api/test/specialists', () => testApiService.specialists.getAll());

    // Test 3: Rendez-vous
    await runTest('GET /api/test/appointments', () => testApiService.appointments.getAll());

    // Test 4: Données de santé
    await runTest('GET /api/test/mood', () => testApiService.health_data.getMood());

    // Test 5: Test d'authentification
    await runTest('POST /api/test/login', () => 
      testApiService.auth.testLogin({ email: 'test@example.com', password: 'password123' })
    );

    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'loading': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          🧪 Test de l'API Laravel-React
        </h1>
        <p className="text-gray-600 mb-6">
          Cette page teste la connexion entre le frontend React et le backend Laravel
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? '⏳ Tests en cours...' : '🚀 Lancer tous les tests'}
          </Button>
          <Button 
            variant="outline" 
            onClick={clearResults}
            disabled={isRunning}
          >
            🗑️ Effacer les résultats
          </Button>
        </div>
      </div>

      {/* Résultats des tests */}
      <div className="space-y-4">
        {testResults.map((result, index) => (
          <Card key={index} className="border-l-4" style={{borderLeftColor: getStatusColor(result.status) === 'bg-green-500' ? '#10b981' : getStatusColor(result.status) === 'bg-red-500' ? '#ef4444' : getStatusColor(result.status) === 'bg-yellow-500' ? '#f59e0b' : '#6b7280'}}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-mono">
                  {result.endpoint}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {result.timestamp}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{result.message}</p>
              {result.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    📋 Voir les données reçues
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {testResults.length === 0 && !isRunning && (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-gray-500">
              Cliquez sur "Lancer tous les tests" pour commencer le test de l'API
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiTestPage;
