import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface ColumnInfo {
    name: string;
    type: string;
    keys: string[];
    default: string | null;
}

interface ChallengesTableData {
    success: boolean;
    table: string;
    schema: string;
    total_rows: number;
    columns: ColumnInfo[];
}

/**
 * Composant pour afficher les informations de la table challenges
 */
export const ChallengesTableInfo: React.FC = () => {
    const [data, setData] = useState<ChallengesTableData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChallengesInfo = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('http://127.0.0.1:8081/api/test/db/challenges-info');

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const result: ChallengesTableData = await response.json();
                setData(result);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChallengesInfo();
    }, []);

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Chargement des informations...
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full border-red-200 bg-red-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        Erreur
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-600">{error}</p>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                        <CardTitle className="text-2xl">📋 Table: {data.table.toUpperCase()}</CardTitle>
                        <CardDescription className="text-lg">
                            Base de données: <strong>{data.schema}</strong> • Lignes: <strong>{data.total_rows}</strong>
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-300 bg-gray-50">
                                <th className="text-left p-3 font-semibold text-gray-700 w-32">N°</th>
                                <th className="text-left p-3 font-semibold text-gray-700 w-40">Colonne</th>
                                <th className="text-left p-3 font-semibold text-gray-700 flex-1">Type</th>
                                <th className="text-left p-3 font-semibold text-gray-700 w-48">Propriétés</th>
                                <th className="text-left p-3 font-semibold text-gray-700 w-32">Défaut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.columns.map((col: ColumnInfo, index: number) => (
                                <tr
                                    key={col.name}
                                    className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                        } hover:bg-blue-50 transition-colors`}
                                >
                                    <td className="p-3 text-gray-600 font-medium">{index + 1}</td>
                                    <td className="p-3 font-mono font-bold text-blue-700">{col.name}</td>
                                    <td className="p-3 font-mono text-gray-700">{col.type}</td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-1">
                                            {col.keys.map((key: string) => (
                                                <span
                                                    key={key}
                                                    className={`px-2 py-1 rounded text-xs font-semibold ${key === 'PK'
                                                            ? 'bg-red-100 text-red-700'
                                                            : key === 'AI'
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : key === 'NOT NULL'
                                                                    ? 'bg-purple-100 text-purple-700'
                                                                    : key === 'UNIQUE'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {key}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-3 font-mono text-gray-600">
                                        {col.default ? (
                                            <span className="bg-yellow-50 px-2 py-1 rounded">{col.default}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Résumé des clés */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-800 mb-3">📌 Légende des propriétés:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">PK</span>
                            <span className="text-sm text-gray-700">Clé primaire</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-700">AI</span>
                            <span className="text-sm text-gray-700">Auto-incrémenté</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700">NOT NULL</span>
                            <span className="text-sm text-gray-700">Requis</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">UNIQUE</span>
                            <span className="text-sm text-gray-700">Unique</span>
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <div className="text-xs text-gray-600 font-semibold">Total colonnes</div>
                        <div className="text-2xl font-bold text-gray-800">{data.columns.length}</div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <div className="text-xs text-gray-600 font-semibold">Lignes actuelles</div>
                        <div className="text-2xl font-bold text-gray-800">{data.total_rows}</div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <div className="text-xs text-gray-600 font-semibold">Clés primaires</div>
                        <div className="text-2xl font-bold text-red-600">
                            {data.columns.filter((c: ColumnInfo) => c.keys.includes('PK')).length}
                        </div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <div className="text-xs text-gray-600 font-semibold">Champs requis</div>
                        <div className="text-2xl font-bold text-purple-600">
                            {data.columns.filter((c: ColumnInfo) => c.keys.includes('NOT NULL')).length}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ChallengesTableInfo;
