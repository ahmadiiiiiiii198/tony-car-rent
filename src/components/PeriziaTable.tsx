import React from 'react';
import { Check, X, Award } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export interface PeriziaTableProps {
    onSelectPlan: (planName: string) => void;
}

export const PeriziaTable: React.FC<PeriziaTableProps> = ({ onSelectPlan }) => {
    const { settings } = useSettings();
    const plans = settings.periziaPlans || [];
    const features = settings.periziaFeatures || [];

    if (plans.length === 0) return null;

    // Helper to determine if a plan is "Premium" or highlighted
    const isHighlighted = (plan: typeof plans[0]) => plan.highlight === true;

    return (
        <div className="perizia-table-container">
            <div className="perizia-table-wrapper">
                <table className="perizia-table">
                    <thead>
                        <tr>
                            <th className="feature-column">Caratteristiche</th>
                            {plans.map(plan => (
                                <th key={plan.id} className={`plan-column ${isHighlighted(plan) ? 'highlighted' : ''}`}>
                                    {isHighlighted(plan) && <div className="plan-badge">Consigliato</div>}
                                    <div className="plan-header">
                                        <span className="plan-name">{plan.name}</span>
                                        <span className="plan-price">€{plan.price}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {features.map(feature => (
                            <tr key={feature.id}>
                                <td className="feature-label">
                                    <Award size={14} className="feature-icon" />
                                    {feature.label}
                                </td>
                                {plans.map(plan => (
                                    <td key={`${plan.id}-${feature.id}`} className={`feature-check ${isHighlighted(plan) ? 'highlighted-cell' : ''}`}>
                                        {plan.features.includes(feature.id) ? (
                                            <div className="check-icon-wrapper active">
                                                <Check size={16} />
                                            </div>
                                        ) : (
                                            <div className="check-icon-wrapper inactive">
                                                <X size={16} />
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td></td>
                            {plans.map(plan => (
                                <td key={`btn-${plan.id}`} className={`plan-footer ${isHighlighted(plan) ? 'highlighted-footer' : ''}`}>
                                    <button
                                        className={`select-plan-btn ${isHighlighted(plan) ? 'primary' : 'secondary'}`}
                                        onClick={() => onSelectPlan(plan.name)}
                                    >
                                        Scegli {plan.name}
                                    </button>
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="perizia-mobile-grid">
                {plans.map(plan => (
                    <div key={plan.id} className={`perizia-plan-card ${isHighlighted(plan) ? 'highlighted' : ''}`}>
                        {isHighlighted(plan) && <div className="card-badge">Consigliato</div>}
                        <div className="plan-card-header">
                            <h3>{plan.name}</h3>
                            <div className="price">€{plan.price}</div>
                        </div>
                        <ul className="plan-card-features">
                            {features.map(feature => (
                                <li key={feature.id} className={plan.features.includes(feature.id) ? 'included' : 'excluded'}>
                                    {plan.features.includes(feature.id) ? <Check size={14} /> : <X size={14} />}
                                    {feature.label}
                                </li>
                            ))}
                        </ul>
                        <div className="plan-card-footer">
                            <button
                                className={`select-plan-btn full-width ${isHighlighted(plan) ? 'primary' : 'secondary'}`}
                                onClick={() => onSelectPlan(plan.name)}
                            >
                                Scegli {plan.name}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
