import React from 'react';
import '../View/RatesView.css';

/**
 * Компонент для отображения списка курсов валют в виде таблицы.
 * @param {object} props - Свойства, переданные от родителя.
 * @param {Array} props.rates - Массив объектов с данными о валютах.
 */
function RatesView({ rates }) {
    if (!rates || rates.length === 0) {
        return <div className="loading-message">Загрузка курсов...</div>;
    }

    const formatDate = (dateString) => {
        // Преобразуем "2025-07-09T00:00:00" в более читаемый формат, например "09.07.2025"
        const date = new Date(dateString);
        // toLocaleDateString отформатирует дату согласно локальным настройкам браузера
        return date.toLocaleDateString('ru-RU'); // 'ru-RU' для формата ДД.ММ.ГГГГ
    };

    return (
        <div className="rates-view-container">
            {/!* Заголовок для нашей таблицы *!/}
            <div className="rates-header rate-row">
                <div className="currency-description">Валюта</div>
                <div className="currency-value">Курс (BYN)</div>
                <div className="currency-date">Дата</div>
            </div>

            {rates.map(currency => (
                // Используем Cur_Abbreviation как ключ, так как он тоже уникален.
                <div key={currency.Cur_Abbreviation} className="rate-row">

                    {/!* Столбец 1: Описание валюты *!/}
                    <div className="currency-description">
                        <span className="currency-scale">{currency.Cur_Scale}</span>
                        <span className="currency-full-name">{currency.Cur_Name}</span>
                    </div>

                    {/!* Столбец 2: Курс *!/}
                    <div className="currency-value">
                        {String(currency.Cur_OfficialRate)}
                    </div>

                    {/!* Столбец 3: Дата *!/}
                    <div className="currency-date">
                        {formatDate(currency.Date)}
                    </div>

                </div>
            ))}
        </div>
    );
}

export default RatesView;