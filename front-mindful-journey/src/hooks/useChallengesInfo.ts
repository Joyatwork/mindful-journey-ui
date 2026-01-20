import { useEffect, useState } from 'react';

interface ColumnInfo {
  name: string;
  type: string;
  keys: string[];
  default: string | null;
}

interface ChallengesTableInfo {
  success: boolean;
  table: string;
  schema: string;
  total_rows: number;
  columns: ColumnInfo[];
}

/**
 * Hook pour charger les informations de la table challenges au démarrage
 * Affiche les détails de la structure dans la console
 */
export const useChallengesInfo = () => {
  const [data, setData] = useState<ChallengesTableInfo | null>(null);
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

        const result: ChallengesTableInfo = await response.json();
        setData(result);

        // Afficher les informations dans la console et dans un format lisible
        if (result.success) {
          console.log('='.repeat(80));
          console.log(`📋 TABLE: ${result.table.toUpperCase()}`);
          console.log('='.repeat(80));
          console.log(`Schema: ${result.schema}`);
          console.log(`Total rows: ${result.total_rows}`);
          console.log('');
          console.log('COLUMNS:');
          console.log('-'.repeat(80));
          
          result.columns.forEach((col, index) => {
            const keysStr = col.keys.length > 0 ? ` [${col.keys.join(' ')}]` : '';
            const defaultStr = col.default ? ` = ${col.default}` : '';
            console.log(`${index + 1}. ${col.name.padEnd(25)} ${col.type.padEnd(30)}${keysStr}${defaultStr}`);
          });
          
          console.log('='.repeat(80));

          // Afficher aussi sous forme de texte formaté
          let formattedText = `Table: ${result.table}\nColumns:\n`;
          result.columns.forEach((col) => {
            const keysStr = col.keys.length > 0 ? ` ${col.keys.join(' ')}` : '';
            formattedText += `${col.name} ${col.type}${keysStr}\n`;
          });
          console.log('Formatted text:');
          console.log(formattedText);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error fetching challenges info:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallengesInfo();
  }, []);

  return { data, isLoading, error };
};
