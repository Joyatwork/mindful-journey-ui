import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import apiService from '@/lib/api';

type ContenItem = {
    id: number;
    title?: string;
    body?: string;
    url?: string | null;
    type?: string;
    practitioner_id?: number | null;
    created_at?: string | null;
    read_at?: string | null;
    seen?: number | null;
};

interface PersonalizedContensProps {
    unreadOnly?: boolean;
    limit?: number;
}

const PersonalizedContens: React.FC<PersonalizedContensProps> = ({ unreadOnly = true, limit = 10 }) => {
    const [items, setItems] = useState<ContenItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiService.contens.list({ unreadOnly, limit });
            const list = Array.isArray(res?.items) ? res.items as ContenItem[] : [];
            setItems(list);
        } catch (e: any) {
            setError(e?.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    }, [unreadOnly, limit]);

    useEffect(() => { void load(); }, [load]);

    const markRead = async (id: number) => {
        try {
            await apiService.contens.markRead(id);
            await load();
        } catch (e: any) {
            setError(e?.message || 'Erreur lors du marquage');
        }
    };

    return (
        <Card className="border rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Suggestions de votre praticien</CardTitle>
                <div className="flex items-center gap-2">
                    {unreadOnly && <Badge variant="secondary">Non lus</Badge>}
                    <Button variant="ghost" size="sm" onClick={() => load()} disabled={loading}>Rafraîchir</Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading && <div className="text-sm text-gray-500">Chargement…</div>}
                {error && <div className="text-sm text-red-600">{error}</div>}
                {!loading && !error && items.length === 0 && (
                    <div className="text-sm text-gray-500">Aucune suggestion à afficher.</div>
                )}
                <div className="space-y-3">
                    {items.map((it) => {
                        const isRead = (it.read_at != null) || (typeof it.seen === 'number' && it.seen > 0);
                        return (
                            <div key={it.id} className="p-3 rounded-lg border bg-white/80 flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{it.title || 'Suggestion'}</span>
                                        {it.type && <Badge variant="outline" className="text-xs">{it.type}</Badge>}
                                        {!isRead && <Badge className="text-xs">Nouveau</Badge>}
                                    </div>
                                    {it.body && <div className="text-sm text-gray-700 whitespace-pre-wrap">{it.body}</div>}
                                    <div className="text-xs text-gray-400">
                                        {it.created_at ? new Date(it.created_at).toLocaleString() : ''}
                                    </div>
                                    {it.url && (
                                        <a href={it.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">Ouvrir</a>
                                    )}
                                </div>
                                <div className="shrink-0">
                                    {!isRead ? (
                                        <Button size="sm" onClick={() => markRead(it.id)}>Marquer lu</Button>
                                    ) : (
                                        <Badge variant="secondary">Lu</Badge>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default PersonalizedContens;
