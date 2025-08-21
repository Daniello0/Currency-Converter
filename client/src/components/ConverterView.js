import React, {useEffect, useMemo, useRef, useState} from 'react';
import './ConverterView.css';
import {Flag} from "../services/Flag.js";
import ServerController from "../services/ServerController.js";

function ConverterView() {

    const [initialAbbreviations, setInitialAbbreviations ] = useState([]);
    const [isInitialAbbrLoaded, setIsInitialAbbrLoaded ] = useState(false);

    useEffect(() => {
        if (!isInitialAbbrLoaded) {
            (async () => {
                const abbr_s = await ServerController.getCurrencies();
                if (abbr_s) {
                    setInitialAbbreviations(abbr_s);
                }
            })()
            setIsInitialAbbrLoaded(true);
        }
    }, [])

    // Валюты BYN нет в rates, поэтому ее необходимо добавить
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

    /*const rates = useMemo(() => {
        const ratesWithByn = [...initialRates];
        if (!ratesWithByn.find(r => r.abbreviation === 'BYN')) {
            ratesWithByn.push(new Currency({
                name: "Белорусский рубль",
                scale: 1,
                abbreviation: "BYN",
                officialRate: 1.0,
                updateDate: new Date()
            }));
        }
        return ratesWithByn;
    }, [initialRates]);*/

    const [amount, setAmount] = useState(0);
    const [isAmountLoaded, setIsAmountLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            const user = await ServerController.getUser();
            if (user) {
                setAmount(user.amount);
                setIsAmountLoaded(true);
            }
        })()
    }, []);

    useEffect(() => {
        if (isAmountLoaded) {
            (async () => {
                await ServerController.upsertUser({
                    amount: amount
                });
            })();
        }
    }, [amount, isAmountLoaded]);

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

    const [targetCurrencies, setTargetCurrencies] = useState([]);
    const [isTargetCurrenciesLoaded, setIsTargetCurrenciesLoaded] = useState(false);
    const serverTargetsRef = useRef(null)

    // Загрузка targets при монтировании
    useEffect(() => {
        let cancelled = false;

        (async () => {
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
        })();

        return () => { cancelled = true; };
    }, []);

    // запись в БД только при изменениях
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
        const newTargets = new Array(targetCurrencies);
        if (checked) newTargets.push(value);
        else newTargets.filter(item => item !== value);
        setTargetCurrencies(newTargets);
    };

    const [ratesData, setRatesData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                setError(null);

                const numericAmount = parseFloat(amount);
                const result = await ServerController.getRates(baseCurrency, numericAmount,
                    targetCurrencies);
                setRatesData(result);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
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
        return <div>Загрузка...</div>
    }

    if (isLoading) {
        return <div>Загрузка курсов...</div>;
    }

    if (error) {
        return <div>Ошибка при загрузке данных!</div>;
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
                            abbr !== baseCurrency && (
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