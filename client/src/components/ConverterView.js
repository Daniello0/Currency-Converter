import React, {useEffect, useMemo, useRef, useState} from 'react';
import './ConverterView.css';
import {Flag} from "../services/Flag.js";
import ServerController from "../services/ServerController.js";

function ConverterView() {

    const [initialAbbreviations, setInitialAbbreviations ] = useState([]);
    const [isInitialAbbrLoaded, setIsInitialAbbrLoaded ] = useState(false);
    const [amount, setAmount] = useState(0);
    const [isAmountLoaded, setIsAmountLoaded] = useState(false);
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [isBaseCurrencyLoaded, setIsBaseCurrencyLoaded] = useState(false);
    const [targetCurrencies, setTargetCurrencies] = useState([]);
    const [isTargetCurrenciesLoaded, setIsTargetCurrenciesLoaded] = useState(false);
    const serverTargetsRef = useRef(null)

    useEffect(() => {
        (async () => {

            const user = await ServerController.getUser();
            const abbr_s = await ServerController.getCurrencies();

            //load abbreviations
            if (abbr_s) {
                setInitialAbbreviations(abbr_s);
                setIsInitialAbbrLoaded(true);
            }

            if (user) {
                //load amount
                setAmount(user.amount);
                setIsAmountLoaded(true);

                //load baseCurrency
                setBaseCurrency(user.base_currency);
                setIsBaseCurrencyLoaded(true);

                //loadTargets
                await loadTargets();
                }
            })();
    }, []);

    // Валюты BYN нет, поэтому ее необходимо добавить
    const abbreviations = useMemo(() => {
        if (!isInitialAbbrLoaded) {
            return;
        }

        const abbreviationsWithByn = [...initialAbbreviations];

        if (!abbreviationsWithByn.find(abbr => abbr === 'BYN')) {
            abbreviationsWithByn.push('BYN');
        }

        return abbreviationsWithByn
    }, [initialAbbreviations])

    useEffect(() => {
        if (isAmountLoaded) {
            (async () => {
                await ServerController.upsertUser({
                    amount: amount
                });
            })();
        }
    }, [amount, isAmountLoaded]);

    // сохранение данных baseCurrency
    useEffect(() => {
        if (isBaseCurrencyLoaded) {
            (async () => {
                await ServerController.upsertUser({
                    base_currency: baseCurrency
                });
            })();
        }
    }, [baseCurrency, isBaseCurrencyLoaded]);

    // Загрузка targets при монтировании
    async function loadTargets() {
        let cancelled = false;

        try {
            const user = await ServerController.getUser();
            const loaded = user && typeof user.targets === 'string'
                ? (user.targets === '' ? [] : user.targets.split(','))
                : [];

            if (!cancelled) {
                serverTargetsRef.current = loaded;
                setTargetCurrencies(loaded);
                setIsTargetCurrenciesLoaded(true);
            }
        } catch (e) {
            console.error('Не удалось загрузить избранное:', e);
            if (!cancelled) {
                setIsTargetCurrenciesLoaded(true);
            }
        }

        return () => { cancelled = true; };
    }

    // запись в БД targetCurrencies только при изменениях
    useEffect(() => {
        if (!isTargetCurrenciesLoaded) return;
        if (serverTargetsRef.current) {
            const sameLength = serverTargetsRef.current.length === targetCurrencies.length;
            const sameValues = sameLength && serverTargetsRef.current.every((v, i) => v === targetCurrencies[i]);
            if (sameValues) {
                serverTargetsRef.current = null;
                return;
            }
            serverTargetsRef.current = null;
        }

        (async () => {
            try {
                await ServerController.upsertUser({
                    targets: targetCurrencies.join(',')
                });
            } catch (e) {
                console.error('Не удалось сохранить избранное:', e);
            }
        })();
    }, [targetCurrencies, isTargetCurrenciesLoaded]);


    const handleAmountChange = (e) => {
        if (e.target.value === '' || parseFloat(e.target.value) >= 0) {
            setAmount(e.target.value);
        }
    };
    const handleBaseCurrencyChange = (e) => setBaseCurrency(e.target.value);
    const handleTargetChange = (e) => {
        const { value, checked } = e.target;

        setTargetCurrencies(prevTargets => {
            if (checked) {
                return [...prevTargets, value];
            } else {
                return prevTargets.filter(currency => currency !== value);
            }
        });
    };

    const [ratesData, setRatesData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                setError(null);

                const numericAmount = parseFloat(amount);
                const result = await ServerController.getRates(baseCurrency, numericAmount,
                    targetCurrencies);
                setRatesData(result);
            } catch (e) {
                console.error(e);
            } finally {
            }
        })()
    }, [amount, baseCurrency, targetCurrencies]);

    const conversionResults = useMemo(() => {
        if (!ratesData || !ratesData.target) {
            return [];
        }

        return ratesData.target.map(targetObj => {
            return {
                code: targetObj.abbreviation, // В вашем объекте это abbreviation
                name: targetObj.name || '',
                value: targetObj.amount != null // Проверяем на null/undefined
                    ? targetObj.amount.toLocaleString('ru-RU', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
                    : 'сумма не определена',
            };
        });
    }, [ratesData]);

    if (!abbreviations) {
        return <div className="loading-message">Загрузка...</div>;
    }

    /*if (isLoading) {
        return <div>Загрузка...</div>;
    }*/

    if (error) {
        return <div>Ошибка при загрузке данных</div>;
    }

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
                        {abbreviations.map(abbr => (
                            <option key={abbr} value={abbr}>
                                {Flag.getFlagEmoji(abbr)} {abbr}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="target-currencies">
                    <label>Валюты</label>
                    <div className="checklist-box">
                        {abbreviations.map(abbr => (
                                <label key={abbr} className="check-item">
                                    <input
                                        type="checkbox"
                                        value={abbr}
                                        checked={targetCurrencies.includes(abbr)}
                                        onChange={handleTargetChange}
                                    />
                                    {Flag.getFlagEmoji(abbr)} {abbr}
                                </label>
                            )
                        )}
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