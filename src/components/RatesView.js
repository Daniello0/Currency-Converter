import React from 'react';
import './RatesView.css';

/**
 * Компонент для отображения списка курсов валют в виде таблицы.
 * @param {object} props - Свойства, переданные от родителя.
 * @param {Array} props.rates - Массив объектов с данными о валютах.
 */
function RatesView( { rates }) {

    console.log("Данные, пришедшие в RatesView: ", rates);

    if (!rates || rates.length === 0) {
        return <div className="loading-message">Загрузка курсов...</div>;
    }

    const formatDate = (dateString) => {
        // Преобразуем "2025-07-09T00:00:00" в более читаемый формат, например "09.07.2025"
        const date = new Date(dateString);
        // toLocaleDateString отформатирует дату согласно локальным настройкам браузера
        return date.toLocaleDateString('ru-RU'); // 'ru-RU' для формата ДД.ММ.ГГГГ
    };

    console.log("Перед рендерингом страницы RatesView");

    return (
        <div className="rates-view-container">
            {/* Заголовок для нашей таблицы */}
            <div className="rates-header rate-row">
                <div className="currency-description">Валюта</div>
                <div className="currency-value">Курс (BYN)</div>
                <div className="currency-date">Дата</div>
            </div>
            {rates.map((currency, index) => (
                <div key={String(currency.abbreviation)} className="rate-row">

                    {/* Столбец 1: Описание валюты */}
                    <div className="currency-description">
                        <span className="currency-scale">{String(currency.scale)}</span>
                        <span className="currency-full-name">{String(currency.name)} ({String(currency.abbreviation)})</span>
                    </div>

                    {/* Столбец 2: Курс */}
                    <div className="currency-value">
                        {String(currency.officialRate)}
                    </div>

                    {/* Столбец 3: Дата */}
                    <div className="currency-date">
                        {String(formatDate(currency.updateDate))}
                    </div>

                </div>
            ))}
        </div>
    );
}

export default RatesView;