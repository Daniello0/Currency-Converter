import React, {useEffect, useMemo, useState} from 'react';
import './ConverterView.css';
import Converter from "../services/Converter";
import Currency from "../models/Currency";

const getFlagEmoji = (currencyCode) => {
    if (!currencyCode || currencyCode.length < 2) return '🏳️';
    const codePoints = currencyCode.substring(0, 2).toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

function ConverterView( {rates : initialRates} ) {

    // Валюты BYN нет в rates, поэтому ее необходимо добавить
    const rates = useMemo(() => {
        const ratesWithByn = [...initialRates]; // Создаем копию
        if (!ratesWithByn.find(r => r.abbreviation === 'BYN')) {
            ratesWithByn.push(new Currency({
                name: "Белорусский рубль",
                scale: 1,
                abbreviation: "BYN",
                officialRate: 1.0,
                updateDate: new Date() // Используем текущую дату
            }));
        }
        return ratesWithByn;
    }, [initialRates]);

    console.log("Переданный список в ConverterView - ", rates);

    const [amount, setAmount] = useState(() => {
        try {
            const amount = localStorage.getItem('amount');
            return amount ? amount : 0;
        } catch(e) {
            console.error("Ошибка при чтении amount в ConverterView - ", e);
            return 0;
        }
    });
    const [baseCurrency, setBaseCurrency] = useState(() => {
        try {
            const baseCurrency = localStorage.getItem('baseCurrency');
            return baseCurrency ? baseCurrency : 'USD';
        } catch(e) {
            console.error("Ошибка при чтении baseCurrency в ConverterView - ", e);
            return 'USD';
        }
    });
    const [targetCurrencies, setTargetCurrencies] = useState(() => {
        try {
            const targetCurrencies = localStorage.getItem('targetCurrencies');
            if (targetCurrencies) {
                return new Set(JSON.parse(targetCurrencies));
            }
            return new Set(['EUR', 'BYN', 'RUB']);
        } catch(e) {
            console.error("Ошибка при чтении targetCurrencies - ", e);
            return new Set(['EUR', 'BYN', 'RUB']);
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('amount', amount);
        } catch(e) {
            console.error("Невозможно сохранить amount - ", e);
        }
    }, [amount]);

    useEffect(() => {
        try {
            localStorage.setItem('baseCurrency', baseCurrency);
        } catch(e) {
            console.error("Невозможно сохранить baseCurrency - ", e);
        }
    }, [baseCurrency]);

    useEffect(() => {
        try {
            localStorage.setItem('targetCurrencies', JSON.stringify(Array.from(targetCurrencies)));
        } catch(e) {
            console.error("Невозможно сохранить targetCurrencies - ", e);
        }
    }, [targetCurrencies]);

    const handleAmountChange = (e) => setAmount(Number(e.target.value));
    const handleBaseCurrencyChange = (e) => setBaseCurrency(e.target.value);
    const handleTargetChange = (e) => {
        const { value, checked } = e.target;
        const newTargets = new Set(targetCurrencies);
        if (checked) newTargets.add(value);
        else newTargets.delete(value);
        setTargetCurrencies(newTargets);
    };

    const conversionResults = useMemo(() => {
        return Array.from(targetCurrencies).map(targetCode => {
            const value = Converter.convertBetweenCurrencies(amount, baseCurrency,
                targetCode, rates);
            const targetCurrency = rates.find(r => r.abbreviation === targetCode);
            return {
                code: targetCode,
                name: targetCurrency ? targetCurrency.name : '',
                value: value.toLocaleString('ru-RU', { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
            };
        });
    }, [amount, baseCurrency, targetCurrencies, rates]);

    return (
        <div className="converter-view-container">
            <div className="converter-controls">
                <div className="input-group">
                    <label>Сумма</label>
                    <input
                        type="number"
                        className="amount-input"
                        value={amount}
                        onChange={handleAmountChange}
                        min="0"
                    />
                    <select
                        className="currency-select"
                        value={baseCurrency}
                        onChange={handleBaseCurrencyChange}
                    >
                        {rates.map(rate => (
                            <option key={rate.abbreviation} value={rate.abbreviation}>
                                {getFlagEmoji(rate.abbreviation)} {rate.abbreviation}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="target-currencies">
                    <label>Валюты</label>
                    <div className="checklist-box">
                        {rates.map(rate => (
                            rate.abbreviation !== baseCurrency && (
                                <label key={rate.abbreviation} className="check-item">
                                    <input
                                        type="checkbox"
                                        value={rate.abbreviation}
                                        checked={targetCurrencies.has(rate.abbreviation)}
                                        onChange={handleTargetChange}
                                    />
                                    {getFlagEmoji(rate.abbreviation)} {rate.abbreviation}
                                </label>
                            )
                        ))}
                    </div>
                </div>
            </div>

            <div className="converter-results">
                {conversionResults.length > 0 ? (
                    conversionResults.map(result => (
                        <div key={result.code} className="result-row">
                            <span className="result-name">
                                {getFlagEmoji(result.code)} {result.name}
                            </span>
                            <span className="result-value">{result.value}</span>
                        </div>
                    ))
                ) : (
                    <div className="no-results">Валюты не выбраны</div>
                )}
            </div>
        </div>
    );
}

export default ConverterView;