import React from 'react';
import './RatesView.css';
import { Flag } from '../services/Flag.ts';

function RatesView({ rates, favorites, onToggleFavorite }) {
    if (!rates || rates.length === 0) {
        return <div className="loading-message">Загрузка...</div>;
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };

    return (
        <div className="rates-view-container">
            <div className="rates-header rate-row">
                <div className="currency-description">Валюта</div>
                <div className="currency-value">Курс (BYN)</div>
                <div className="currency-date">Дата</div>
                <div className="favorite-column">Избранное</div>
            </div>
            {rates.map((currency) => {
                const isFavorite = favorites.includes(currency.abbreviation);

                return (
                    <div key={String(currency.abbreviation)} className="rate-row">
                        {/* Столбец 1: Описание валюты */}
                        <div className="currency-description">
                            <span className="currency-scale">
                                {String(currency.scale)}
                            </span>
                            <span className="currency-full-name">
                                {String(currency.name)} ({String(currency.abbreviation)})
                            </span>
                            <span className="currency-flag">
                                {Flag.getFlagEmoji(currency.abbreviation)}
                            </span>
                        </div>

                        {/* Столбец 2: Курс */}
                        <div className="currency-value">
                            {String(currency.officialRate)}
                        </div>

                        {/* Столбец 3: Дата */}
                        <div className="currency-date">
                            {String(formatDate(currency.updateDate))}
                        </div>

                        {/*Столбец 4: Избраннле*/}
                        <div className="favorite-column">
                            <span
                                className={`favorite-star ${isFavorite ? 'is-favorite' : ''}`}
                                tabIndex="0"
                                role="button"
                                onClick={() => onToggleFavorite(currency.abbreviation)}
                            >
                                {isFavorite ? '★' : '☆'}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default RatesView;
