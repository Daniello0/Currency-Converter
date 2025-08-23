import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import './ConverterView.css';
import Flag from '../services/Flag.ts';
import ServerController from '../services/ServerController.ts';

type User = {
    amount: string;
    base_currency: string;
    targets: string;
    favorites: string;
};

type TargetObject = {
    abbreviation: string;
    name: string;
    amount: number;
};

type ConversionResult = {
    code: string;
    name: string;
    value: string;
};

type RatesData = {
    base: string;
    targets: {
        abbreviation: string;
        amount: number;
        name: string;
    }[];
};

function ConverterView() {
    const [initialAbbreviations, setInitialAbbreviations] = useState<string[]>([]);
    const [isInitialAbbrLoaded, setIsInitialAbbrLoaded] = useState<boolean>(false);
    const [amount, setAmount] = useState<string>('');
    const [baseCurrency, setBaseCurrency] = useState<string>('USD');
    const [targetCurrencies, setTargetCurrencies] = useState<string[]>([]);
    const [isTargetCurrenciesLoaded, setIsTargetCurrenciesLoaded] =
        useState<boolean>(false);
    const serverTargetsRef: RefObject<string[] | null> = useRef([]);

    // Валюты BYN нет, поэтому ее необходимо добавить
    const abbreviations = useMemo(() => {
        if (!isInitialAbbrLoaded) {
            return;
        }

        const abbreviationsWithByn: string[] = [...initialAbbreviations];

        if (!abbreviationsWithByn.find((abbr) => abbr === 'BYN')) {
            abbreviationsWithByn.push('BYN');
        }

        return abbreviationsWithByn;
    }, [initialAbbreviations]);

    useEffect(() => {
        (async () => {
            ServerController.getCurrencies().then((r) => {
                setInitialAbbreviations(r);
                setIsInitialAbbrLoaded(true);
            });

            ServerController.getUser().then((r: User) => {
                setAmount(r.amount);

                setBaseCurrency(r.base_currency);

                loadTargets(r);
            });
        })();
    }, []);

    // Загрузка targets при монтировании
    async function loadTargets(user: User) {
        let cancelled = false;

        try {
            const loaded: string[] = user
                ? user.targets === ''
                    ? []
                    : user.targets.split(',')
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

        return () => {
            cancelled = true;
        };
    }

    // запись в БД targetCurrencies только при изменениях
    useEffect(() => {
        if (!isTargetCurrenciesLoaded) return;
        if (serverTargetsRef.current) {
            serverTargetsRef.current = null;
            return;
        }

        (async () => {
            try {
                setTimeout(async () => {
                    await ServerController.upsertUser({
                        amount: amount,
                        base_currency: baseCurrency,
                        targets: targetCurrencies.join(','),
                    });
                }, 100);
            } catch (e) {
                console.error('Не удалось сохранить настройки:', e);
            }
        })();
    }, [amount, baseCurrency, targetCurrencies, isTargetCurrenciesLoaded]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget;
        if (value === '' || parseFloat(value) >= 0) {
            setAmount(value);
        }
    };

    const handleBaseCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
        setBaseCurrency(e.currentTarget.value);

    const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.currentTarget;

        setTargetCurrencies((prevTargets: string[]) => {
            if (checked) {
                return [...prevTargets, value];
            } else {
                return prevTargets.filter((currency: string) => currency !== value);
            }
        });
    };

    const [ratesData, setRatesData] = useState<RatesData>();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setError(null);

                const result: RatesData | undefined = await ServerController.getRates(
                    baseCurrency,
                    targetCurrencies
                );
                setRatesData(result);
            } catch (e) {
                console.error(e);
            } finally {
            }
        })();
    }, [amount, baseCurrency, targetCurrencies]);

    const conversionResults: ConversionResult[] = useMemo(() => {
        if (!ratesData || !ratesData.targets) {
            return [];
        }

        return ratesData.targets.map((targetObj: TargetObject) => {
            targetObj.amount *= parseFloat(amount);
            return {
                code: targetObj.abbreviation,
                name: targetObj.name || '',
                value:
                    targetObj.amount !== null
                        ? targetObj.amount.toLocaleString('ru-RU', {
                              minimumFractionDigits: 4,
                              maximumFractionDigits: 4,
                          })
                        : 'сумма не определена',
            };
        });
    }, [ratesData]);

    if (!abbreviations) {
        return <div className="loading-message">Загрузка...</div>;
    }

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
                        {abbreviations.map((abbr) => (
                            <option key={abbr} value={abbr}>
                                {Flag.getFlagEmoji(abbr)} {abbr}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="target-currencies">
                    <label>Валюты</label>
                    <div className="checklist-box">
                        {abbreviations.map((abbr) => (
                            <label key={abbr} className="check-item">
                                <input
                                    type="checkbox"
                                    value={abbr}
                                    checked={targetCurrencies.includes(abbr)}
                                    onChange={handleTargetChange}
                                />
                                {Flag.getFlagEmoji(abbr)} {abbr}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="converter-results">
                {conversionResults.length > 0 ? (
                    conversionResults.map((result) => (
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
