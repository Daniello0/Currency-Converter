import React, {useEffect, useMemo, useState} from 'react';
import './ConverterView.css';
import Converter from "../services/Converter.js";
import Currency from "../models/Currency.js";
import {Flag} from "../services/Flag.js";
import ServerController from "../services/ServerController.js";

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

    const [amount, setAmount] = useState(() => {
        try {
            const amount = localStorage.getItem('amount');
            return amount ? amount : '';
        } catch(e) {
            console.error("Ошибка при чтении amount в ConverterView - ", e);
            return '';
        }
    });

    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [isBaseCurrencyLoaded, setIsBaseCurrencyLoaded] = useState(false);

    //загрузка baseCurrency
    useEffect(() => {
        (async () => {
            const user = await ServerController.getUser();
            if (user) {
                setBaseCurrency(user.base_currency);
                setIsBaseCurrencyLoaded(true);
            }
        })();
    }, []);

    // сохранение данных
    useEffect(() => {
        if (isBaseCurrencyLoaded) {
            (async () => {
                await ServerController.upsertUser({
                    base_currency: baseCurrency
                });
            })();
        }
    }, [baseCurrency, isBaseCurrencyLoaded]);

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

    const handleAmountChange = (e) => {
        if (e.target.value === '' || parseFloat(e.target.value) >= 0) {
            setAmount(e.target.value);
        }
    };
    const handleBaseCurrencyChange = (e) => setBaseCurrency(e.target.value);
    const handleTargetChange = (e) => {
        const { value, checked } = e.target;
        const newTargets = new Set(targetCurrencies);
        if (checked) newTargets.add(value);
        else newTargets.delete(value);
        setTargetCurrencies(newTargets);
    };

    const conversionResults = useMemo(() => {

        const numericAmount = parseFloat(amount);

        return Array.from(targetCurrencies).map(targetCode => {
            const value = Converter.convertBetweenCurrencies(numericAmount, baseCurrency,
                targetCode, rates);
            const targetCurrency = rates.find(r => r.abbreviation === targetCode);
            return {
                code: targetCode,
                name: targetCurrency ? targetCurrency.name : '',
                value: value ?
                    value.toLocaleString('ru-RU', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
                    : 'сумма не определена',
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
                                {Flag.getFlagEmoji(rate.abbreviation)} {rate.abbreviation}
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
                                    {Flag.getFlagEmoji(rate.abbreviation)} {rate.abbreviation}
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
                                {Flag.getFlagEmoji(result.code)} {result.name}
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