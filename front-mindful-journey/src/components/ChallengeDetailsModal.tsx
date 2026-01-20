import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Play, X, Pause, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Challenge {
    id: number;
    title: string;
    description?: string;
    duration?: string;
    points?: number;
    icon?: string;
    color?: string;
    objective?: string;
    status: 'not_started' | 'in_progress' | 'finished';
    [key: string]: any;
}

interface ChallengeDetailsModalProps {
    challenge: Challenge | null;
    isOpen: boolean;
    onClose: () => void;
    onStart: (challengeId: number) => Promise<void>;
    onFinish: (challengeId: number) => Promise<void>;
}

/**
 * Modal pour afficher les détails d'un défi avec chrono
 */
export const ChallengeDetailsModal: React.FC<ChallengeDetailsModalProps> = ({
    challenge,
    isOpen,
    onClose,
    onStart,
    onFinish,
}) => {
    const { toast } = useToast();
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [localStatus, setLocalStatus] = useState<'not_started' | 'in_progress' | 'finished'>('not_started');
    const [totalDuration, setTotalDuration] = useState<number>(0);
    const [hasStarted, setHasStarted] = useState(false);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastChallengeIdRef = useRef<number | null>(null);

    // Convertir la durée en secondes
    const parseDuration = (duration?: string): number => {
        if (!duration) return 0;
        const match = duration.match(/(\d+)/);
        if (match) {
            return parseInt(match[1]) * 60;
        }
        return 0;
    };

    // Formater le temps pour affichage
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Initialiser SEULEMENT quand on ouvre une nouvelle modal - JAMAIS une fois qu'on a démarré
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (!challenge) {
            return;
        }

        // Si on n'a pas encore démarré et c'est un nouveau défi, initialiser
        if (!hasStarted && lastChallengeIdRef.current !== challenge.id) {
            lastChallengeIdRef.current = challenge.id;
            setLocalStatus('not_started');

            const duration = parseDuration(challenge.duration);
            setTotalDuration(duration);
            setTimeLeft(duration);
            setIsRunning(false);

            // Cleanup timer
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
        // Une fois qu'on a démarré (hasStarted === true), on n'initialise PLUS jamais
        // même si le challenge prop change!
    }, [isOpen, challenge?.id, hasStarted]);

    // Timer - simple et indépendant
    useEffect(() => {
        // Nettoyer l'ancien timer
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        // Si pas en train de courir, stop
        if (!isRunning) {
            return;
        }

        // Lancer le timer
        timerIntervalRef.current = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };
    }, [isRunning]);

    // Vérifier si le temps est écoulé
    useEffect(() => {
        if (timeLeft === 0 && hasStarted && isRunning) {
            setIsRunning(false);
            toast({
                title: '⏱️ Temps écoulé!',
                description: 'Le défi est terminé. Bien joué!',
            });
        }
    }, [timeLeft, hasStarted, isRunning, toast]);

    // Démarrer le défi
    const handleStart = async () => {
        if (!challenge) return;

        setIsLoading(true);
        try {
            await onStart(challenge.id);

            // Initialiser le chrono localement SEULEMENT
            const durationInSeconds = parseDuration(challenge.duration);
            setTotalDuration(durationInSeconds);
            setTimeLeft(durationInSeconds);
            setLocalStatus('in_progress');
            setHasStarted(true);
            setIsRunning(true);

            toast({
                title: '🎯 Défi démarré!',
                description: `${challenge.title} a commencé. Durée: ${challenge.duration}`,
            });
        } catch (error) {
            toast({
                title: 'Erreur',
                description: 'Impossible de démarrer le défi',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Terminer le défi
    const handleFinish = async () => {
        if (!challenge) return;

        setIsLoading(true);
        try {
            await onFinish(challenge.id);

            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }

            setIsRunning(false);
            setTimeLeft(0);
            setLocalStatus('finished');

            toast({
                title: '🎉 Défi terminé!',
                description: `Bien joué! Vous avez gagné ${challenge.points || 0} points!`,
            });
        } catch (error) {
            toast({
                title: 'Erreur',
                description: 'Impossible de terminer le défi',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Pause/Reprendre
    const togglePause = () => {
        setIsRunning(!isRunning);
    };

    // Cleanup au démontage ou fermeture
    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };
    }, []);

    // Réinitialiser quand la modal se ferme
    useEffect(() => {
        if (!isOpen) {
            setIsRunning(false);
            setHasStarted(false);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
    }, [isOpen]);

    if (!challenge) return null;

    const progressPercentage = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between w-full">
                        <DialogTitle>{challenge.title}</DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-6 w-6"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Description */}
                    {challenge.description && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{challenge.description}</p>
                        </div>
                    )}

                    {/* Objectif */}
                    {challenge.objective && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Objectif</h3>
                            <p className="text-sm text-gray-600">{challenge.objective}</p>
                        </div>
                    )}

                    {/* Informations */}
                    <div className="grid grid-cols-3 gap-2">
                        {challenge.duration && (
                            <Card className="p-3 text-center bg-blue-50 border-blue-200">
                                <Clock className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                                <p className="text-xs font-semibold text-blue-900">{challenge.duration}</p>
                            </Card>
                        )}
                        {challenge.points !== undefined && (
                            <Card className="p-3 text-center bg-yellow-50 border-yellow-200">
                                <p className="text-sm font-bold text-yellow-900">⭐</p>
                                <p className="text-xs font-semibold text-yellow-900">{challenge.points} pts</p>
                            </Card>
                        )}
                        {challenge.intensity_id && (
                            <Card className="p-3 text-center bg-purple-50 border-purple-200">
                                <p className="text-sm font-bold text-purple-900">💪</p>
                                <p className="text-xs font-semibold text-purple-900">Défi</p>
                            </Card>
                        )}
                    </div>

                    {/* Chrono - Affiché si le défi est en cours */}
                    {localStatus === 'in_progress' && (
                        <Card className="p-8 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300">
                            <div className="text-center">
                                <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-widest">Temps restant</p>
                                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 font-mono mb-6 drop-shadow-lg">
                                    {formatTime(timeLeft)}
                                </div>

                                {/* Barre de progression */}
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
                                    <div
                                        className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-300 ease-out"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>

                                <p className="text-xs text-gray-600">
                                    {Math.round(progressPercentage)}% du défi complété
                                </p>
                            </div>
                        </Card>
                    )}

                    {/* État terminé */}
                    {localStatus === 'finished' && (
                        <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 text-center">
                            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-green-900 mb-2">Défi Complété! 🎉</h3>
                            <p className="text-sm text-green-700">
                                Vous avez gagné {challenge.points || 0} points!
                            </p>
                        </Card>
                    )}

                    {/* Boutons d'action */}
                    <div className="flex gap-2 pt-4">
                        {localStatus === 'not_started' && (
                            <Button
                                onClick={handleStart}
                                disabled={isLoading}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white"
                            >
                                <Play className="h-4 w-4 mr-2" />
                                {isLoading ? 'Démarrage...' : 'Démarrer le défi'}
                            </Button>
                        )}

                        {localStatus === 'in_progress' && (
                            <>
                                <Button
                                    onClick={togglePause}
                                    disabled={isLoading}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    {isRunning ? (
                                        <>
                                            <Pause className="h-4 w-4 mr-2" />
                                            Pause
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4 mr-2" />
                                            Reprendre
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleFinish}
                                    disabled={isLoading}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                                >
                                    {isLoading ? 'Finalisation...' : 'Terminer'}
                                </Button>
                            </>
                        )}

                        {localStatus === 'finished' && (
                            <Button
                                onClick={onClose}
                                className="w-full bg-gray-300 text-gray-700 hover:bg-gray-400"
                            >
                                Fermer
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChallengeDetailsModal;
