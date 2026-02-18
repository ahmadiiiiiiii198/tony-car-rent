import { useState, useRef, useEffect, useCallback } from 'react';
import { removeBackground } from '@imgly/background-removal';
import {
    X, Upload, RefreshCw, Check, Image as ImageIcon,
    Paintbrush, Layers, RotateCcw, Wand2
} from 'lucide-react';

interface CarImageEditorProps {
    file: File;
    onComplete: (blob: Blob) => void;
    onCancel: () => void;
}

interface BackgroundPreset {
    id: string;
    name: string;
    type: 'gradient' | 'solid' | 'image';
    value: string;
}

const BACKGROUND_PRESETS: BackgroundPreset[] = [
    { id: 'showroom-dark', name: 'Showroom Scuro', type: 'gradient', value: 'radial-gradient(ellipse at 50% 100%, #2a2a2a 0%, #0a0a0a 70%)' },
    { id: 'showroom-warm', name: 'Showroom Caldo', type: 'gradient', value: 'radial-gradient(ellipse at 50% 100%, #3d2b1f 0%, #1a0f08 70%)' },
    { id: 'showroom-blue', name: 'Showroom Blu', type: 'gradient', value: 'radial-gradient(ellipse at 50% 100%, #1a2a3d 0%, #0a0f1a 70%)' },
    { id: 'studio-white', name: 'Studio Bianco', type: 'gradient', value: 'radial-gradient(ellipse at 50% 100%, #f0f0f0 0%, #d0d0d0 70%)' },
    { id: 'studio-grey', name: 'Studio Grigio', type: 'gradient', value: 'radial-gradient(ellipse at 50% 100%, #4a4a4a 0%, #1a1a1a 70%)' },
    { id: 'luxury-gold', name: 'Luxury Gold', type: 'gradient', value: 'radial-gradient(ellipse at 50% 100%, #3d3520 0%, #1a1508 70%)' },
    { id: 'midnight', name: 'Midnight', type: 'gradient', value: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
    { id: 'sunset', name: 'Tramonto', type: 'gradient', value: 'linear-gradient(180deg, #1a1a2e 0%, #4a2040 40%, #2a1520 100%)' },
    { id: 'solid-black', name: 'Nero', type: 'solid', value: '#0a0a0a' },
    { id: 'solid-white', name: 'Bianco', type: 'solid', value: '#f5f5f5' },
    { id: 'solid-charcoal', name: 'Antracite', type: 'solid', value: '#2d2d2d' },
    { id: 'transparent', name: 'Trasparente', type: 'solid', value: 'transparent' },
];

export const CarImageEditor = ({ file, onComplete, onCancel }: CarImageEditorProps) => {
    const [step, setStep] = useState<'removing' | 'editing'>('removing');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const [originalUrl, setOriginalUrl] = useState<string>('');
    const [removedBgBlob, setRemovedBgBlob] = useState<Blob | null>(null);
    const [removedBgUrl, setRemovedBgUrl] = useState<string>('');

    const [selectedBg, setSelectedBg] = useState<string>('showroom-dark');
    const [customColor, setCustomColor] = useState('#1a1a1a');
    const [customImageUrl, setCustomImageUrl] = useState<string>('');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const customBgInputRef = useRef<HTMLInputElement>(null);
    const [compositing, setCompositing] = useState(false);

    // Create original preview URL
    useEffect(() => {
        const url = URL.createObjectURL(file);
        setOriginalUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    // Run background removal
    useEffect(() => {
        let cancelled = false;

        const runRemoval = async () => {
            try {
                setProgress(0);
                setError(null);

                const result = await removeBackground(file, {
                    progress: (_key: string, current: number, total: number) => {
                        if (!cancelled) {
                            const pct = total > 0 ? Math.round((current / total) * 100) : 0;
                            setProgress(pct);
                        }
                    },
                    output: {
                        format: 'image/png',
                        quality: 0.9
                    }
                });

                if (!cancelled) {
                    const blob = result as Blob;
                    setRemovedBgBlob(blob);
                    const url = URL.createObjectURL(blob);
                    setRemovedBgUrl(url);
                    setStep('editing');
                }
            } catch (err: any) {
                if (!cancelled) {
                    console.error('Background removal failed:', err);
                    setError(err.message || 'Errore nella rimozione dello sfondo');
                }
            }
        };

        runRemoval();

        return () => {
            cancelled = true;
        };
    }, [file]);

    // Cleanup URLs
    useEffect(() => {
        return () => {
            if (removedBgUrl) URL.revokeObjectURL(removedBgUrl);
            if (customImageUrl) URL.revokeObjectURL(customImageUrl);
        };
    }, [removedBgUrl, customImageUrl]);

    const getActivePreset = () => BACKGROUND_PRESETS.find(p => p.id === selectedBg);

    // Draw composite on canvas
    const compositeImage = useCallback(async (): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            if (!removedBgBlob) {
                reject(new Error('No background-removed image'));
                return;
            }

            const canvas = canvasRef.current;
            if (!canvas) {
                reject(new Error('Canvas not found'));
                return;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            const carImg = new Image();
            carImg.onload = () => {
                canvas.width = carImg.width;
                canvas.height = carImg.height;

                const preset = BACKGROUND_PRESETS.find(p => p.id === selectedBg);
                const isTransparent = preset?.value === 'transparent';

                if (isTransparent) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(carImg, 0, 0);
                    canvas.toBlob(
                        (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
                        'image/png'
                    );
                    return;
                }

                if (selectedBg === 'custom-image' && customImageUrl) {
                    const bgImg = new Image();
                    bgImg.onload = () => {
                        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                        ctx.drawImage(carImg, 0, 0);
                        canvas.toBlob(
                            (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
                            'image/png'
                        );
                    };
                    bgImg.onerror = () => reject(new Error('Failed to load background image'));
                    bgImg.src = customImageUrl;
                    return;
                }

                // For gradients and solid colors, use off-screen rendering trick
                const bgValue = selectedBg === 'custom-color' ? customColor : (preset?.value || '#0a0a0a');

                if (preset?.type === 'solid' || selectedBg === 'custom-color') {
                    ctx.fillStyle = bgValue;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(carImg, 0, 0);
                    canvas.toBlob(
                        (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
                        'image/png'
                    );
                    return;
                }

                // For CSS gradients: render via SVG foreignObject
                const svgNS = 'http://www.w3.org/2000/svg';
                const svgStr = `
                    <svg xmlns="${svgNS}" width="${canvas.width}" height="${canvas.height}">
                        <foreignObject width="100%" height="100%">
                            <div xmlns="http://www.w3.org/1999/xhtml"
                                 style="width:${canvas.width}px;height:${canvas.height}px;background:${bgValue};">
                            </div>
                        </foreignObject>
                    </svg>
                `;
                const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
                const svgUrl = URL.createObjectURL(svgBlob);

                const bgSvgImg = new Image();
                bgSvgImg.onload = () => {
                    ctx.drawImage(bgSvgImg, 0, 0);
                    ctx.drawImage(carImg, 0, 0);
                    URL.revokeObjectURL(svgUrl);
                    canvas.toBlob(
                        (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
                        'image/png'
                    );
                };
                bgSvgImg.onerror = () => {
                    // Fallback: just use dark background
                    URL.revokeObjectURL(svgUrl);
                    ctx.fillStyle = '#0a0a0a';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(carImg, 0, 0);
                    canvas.toBlob(
                        (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
                        'image/png'
                    );
                };
                bgSvgImg.src = svgUrl;
            };

            carImg.onerror = () => reject(new Error('Failed to load car image'));
            carImg.src = removedBgUrl;
        });
    }, [removedBgBlob, removedBgUrl, selectedBg, customColor, customImageUrl]);

    const handleConfirm = async () => {
        setCompositing(true);
        try {
            const blob = await compositeImage();
            onComplete(blob);
        } catch (err: any) {
            alert('Errore nella composizione: ' + err.message);
        } finally {
            setCompositing(false);
        }
    };

    const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            if (customImageUrl) URL.revokeObjectURL(customImageUrl);
            const url = URL.createObjectURL(f);
            setCustomImageUrl(url);
            setSelectedBg('custom-image');
        }
    };

    const handleRetryRemoval = () => {
        setError(null);
        setStep('removing');
        setProgress(0);
        setRemovedBgBlob(null);
        setRemovedBgUrl('');

        // Re-trigger removal
        const runRemoval = async () => {
            try {
                const result = await removeBackground(file, {
                    progress: (_key: string, current: number, total: number) => {
                        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
                        setProgress(pct);
                    },
                    output: { format: 'image/png', quality: 0.9 }
                });

                const blob = result as Blob;
                setRemovedBgBlob(blob);
                const url = URL.createObjectURL(blob);
                setRemovedBgUrl(url);
                setStep('editing');
            } catch (err: any) {
                setError(err.message || 'Errore nella rimozione dello sfondo');
            }
        };
        runRemoval();
    };

    const handleSkipRemoval = () => {
        // Use original file as-is (no bg removal)
        setRemovedBgBlob(file);
        const url = URL.createObjectURL(file);
        setRemovedBgUrl(url);
        setStep('editing');
    };

    // ─── Rendering ─────────────────────────────────────────────

    // Step 1: Background Removal
    if (step === 'removing') {
        return (
            <div className="img-editor-overlay">
                <div className="img-editor-modal img-editor-processing">
                    <div className="img-editor-close" onClick={onCancel}><X size={20} /></div>
                    <div className="img-editor-processing-content">
                        <div className="img-editor-original-preview">
                            {originalUrl && <img src={originalUrl} alt="Original" />}
                        </div>

                        {error ? (
                            <div className="img-editor-error">
                                <X size={32} />
                                <h3>Errore</h3>
                                <p>{error}</p>
                                <div className="img-editor-error-actions">
                                    <button className="img-editor-btn secondary" onClick={handleRetryRemoval}>
                                        <RotateCcw size={16} /> Riprova
                                    </button>
                                    <button className="img-editor-btn secondary" onClick={handleSkipRemoval}>
                                        <Upload size={16} /> Usa Originale
                                    </button>
                                    <button className="img-editor-btn secondary" onClick={onCancel}>
                                        <X size={16} /> Annulla
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="img-editor-progress">
                                <Wand2 size={32} className="img-editor-magic-icon" />
                                <h3>Rimozione Sfondo in Corso...</h3>
                                <p>L'intelligenza artificiale sta analizzando l'immagine</p>
                                <div className="img-editor-progress-bar">
                                    <div
                                        className="img-editor-progress-fill"
                                        style={{ width: `${Math.max(progress, 5)}%` }}
                                    />
                                </div>
                                <span className="img-editor-progress-text">{progress}%</span>
                                <button className="img-editor-btn text-btn" onClick={handleSkipRemoval}>
                                    Salta e usa immagine originale
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Background Selection & Editing
    const activeBg = getActivePreset();
    const previewBgStyle: React.CSSProperties = {};

    if (selectedBg === 'custom-color') {
        previewBgStyle.background = customColor;
    } else if (selectedBg === 'custom-image' && customImageUrl) {
        previewBgStyle.backgroundImage = `url(${customImageUrl})`;
        previewBgStyle.backgroundSize = 'cover';
        previewBgStyle.backgroundPosition = 'center';
    } else if (activeBg) {
        if (activeBg.value === 'transparent') {
            previewBgStyle.background = 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px';
        } else {
            previewBgStyle.background = activeBg.value;
        }
    }

    return (
        <div className="img-editor-overlay">
            <div className="img-editor-modal img-editor-full">
                <div className="img-editor-header">
                    <div className="img-editor-header-left">
                        <Layers size={20} />
                        <h3>Editor Immagine Auto</h3>
                    </div>
                    <button className="img-editor-close-btn" onClick={onCancel}><X size={20} /></button>
                </div>

                <div className="img-editor-body">
                    {/* Preview Area */}
                    <div className="img-editor-preview-area">
                        <div className="img-editor-preview" style={previewBgStyle}>
                            {removedBgUrl && <img src={removedBgUrl} alt="Car" />}
                        </div>
                        <div className="img-editor-preview-label">
                            <ImageIcon size={14} /> Anteprima Risultato
                        </div>
                    </div>

                    {/* Controls Sidebar */}
                    <div className="img-editor-sidebar">
                        <div className="img-editor-section">
                            <h4><Paintbrush size={16} /> Sfondi Preset</h4>
                            <div className="img-editor-presets-grid">
                                {BACKGROUND_PRESETS.map(preset => (
                                    <button
                                        key={preset.id}
                                        className={`img-editor-preset-btn ${selectedBg === preset.id ? 'active' : ''}`}
                                        onClick={() => setSelectedBg(preset.id)}
                                        title={preset.name}
                                    >
                                        <div
                                            className="img-editor-preset-swatch"
                                            style={{
                                                background: preset.value === 'transparent'
                                                    ? 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 10px 10px'
                                                    : preset.value
                                            }}
                                        />
                                        <span>{preset.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="img-editor-section">
                            <h4><Paintbrush size={16} /> Colore Personalizzato</h4>
                            <div className="img-editor-custom-color">
                                <input
                                    type="color"
                                    value={customColor}
                                    onChange={e => {
                                        setCustomColor(e.target.value);
                                        setSelectedBg('custom-color');
                                    }}
                                    className="img-editor-color-picker"
                                />
                                <input
                                    type="text"
                                    value={customColor}
                                    onChange={e => {
                                        setCustomColor(e.target.value);
                                        setSelectedBg('custom-color');
                                    }}
                                    className="img-editor-color-text"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>

                        <div className="img-editor-section">
                            <h4><ImageIcon size={16} /> Immagine Sfondo</h4>
                            <button
                                className="img-editor-upload-bg-btn"
                                onClick={() => customBgInputRef.current?.click()}
                            >
                                <Upload size={16} />
                                Carica Immagine di Sfondo
                            </button>
                            <input
                                type="file"
                                ref={customBgInputRef}
                                hidden
                                accept="image/*"
                                onChange={handleCustomBgUpload}
                            />
                            {customImageUrl && (
                                <div className="img-editor-custom-bg-preview">
                                    <img src={customImageUrl} alt="Custom bg" />
                                    <button
                                        className={`img-editor-use-custom-btn ${selectedBg === 'custom-image' ? 'active' : ''}`}
                                        onClick={() => setSelectedBg('custom-image')}
                                    >
                                        Usa questo sfondo
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="img-editor-footer">
                    <button className="img-editor-btn secondary" onClick={onCancel}>
                        <X size={16} /> Annulla
                    </button>
                    <button className="img-editor-btn primary" onClick={handleConfirm} disabled={compositing}>
                        {compositing ? <RefreshCw size={16} className="spin" /> : <Check size={16} />}
                        {compositing ? 'Composizione...' : 'Conferma e Usa'}
                    </button>
                </div>

                {/* Hidden canvas for compositing */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
        </div>
    );
};
