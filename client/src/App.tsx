import React, { useEffect, useMemo, useRef, useState } from 'react';
import './mappers/CurrencyMapper.ts';

import './App.css';
import './Content.css';
import { mapApiDataToCurrencies } from './mappers/CurrencyMapper.ts';
import RatesView from './components/RatesView.tsx';
import ConverterView from './components/ConverterView.tsx';
import ServerController from './services/ServerController.ts';
import Cache from './services/Cache.ts';
import Currency from './models/Currency.ts';

type User = {
    amount: number;
    base_currency: string;
    targets: string;
    favorites: string;
}

function App() {
    const [currencyList, setCurrencyList] = useState([]);
    const [activeView, setActiveView] = useState('none'); // 'none', 'rates', 'converter'
    const [isLoading, setIsLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [favoritesReadyToSync, setFavoritesReadyToSync] = useState(false);
    const serverFavoritesRef = useRef(null);

    useEffect(() => {
        Cache.cleanRequestCache();
    }, []);

    // Загрузка favorites при монтировании
    async function loadFavorites() {
        let cancelled = false;

        try {
            const user: User = await ServerController.getUser();
            const loaded: string[] =
                user && typeof user.favorites === 'string'
                    ? user.favorites === ''
                        ? []
                        : user.favorites.split(',')
                    : [];

            if (!cancelled) {
                serverFavoritesRef.current = loaded;
                setFavorites(loaded);
                setFavoritesReadyToSync(true);
            }
        } catch (e) {
            console.error('Не удалось загрузить избранное:', e);
            if (!cancelled) {
                setFavoritesReadyToSync(true);
            }
        }
        return () => {
            cancelled = true;
        };
    }

    // запись в БД только при изменениях
    useEffect(() => {
        if (!favoritesReadyToSync) return;
        if (serverFavoritesRef.current) {
            const sameLength: boolean = serverFavoritesRef.current.length === favorites.length;
            const sameValues: boolean =
                sameLength &&
                serverFavoritesRef.current.every((v: string, i: string) => v === favorites[i]);
            if (sameValues) {
                serverFavoritesRef.current = null;
                return;
            }
            serverFavoritesRef.current = null;
        }

        (async () => {
            try {
                await ServerController.upsertUser({
                    favorites: favorites.join(','),
                });
            } catch (e) {
                console.error('Не удалось сохранить избранное:', e);
            }
        })();
    }, [favorites, favoritesReadyToSync]);

    const toggleFavorite = (currencyCode: string) => {
        setFavorites((prevFavorites: string[]) => {
            const newFavorites = new Set(prevFavorites);
            if (newFavorites.has(currencyCode)) {
                newFavorites.delete(currencyCode);
            } else {
                newFavorites.add(currencyCode);
            }
            console.log(Array.from(newFavorites));
            return Array.from(newFavorites);
        });
    };

    useEffect(() => {
        (async () => {
            await setActiveViewAndGetCurrencyList('rates').then();
            await loadFavorites();
        })();
    }, []);

    async function buttonShowCurrencyRatesOnClick() {
        await setActiveViewAndGetCurrencyList('rates');
    }

    async function buttonShowConverterOnClick() {
        await setActiveViewAndGetCurrencyList('converter');
    }

    const renderContent = () => {
        if (isLoading) {
            return <div className="loading-message">Загрузка...</div>;
        }

        switch (activeView) {
            case 'rates':
                return (
                    <RatesView
                        rates={sortedCurrencyList}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                    />
                );
            case 'converter': {
                return <ConverterView />;
            }
            default:
                return null;
        }
    };

    async function setActiveViewAndGetCurrencyList(activeViewName: string) {
        setIsLoading(true);
        setActiveView(activeViewName);

        if (activeViewName !== 'converter') {
            console.log('Вызывается функция ServerController.getAllCurrencyInfo()');
            const currencyObject = await ServerController.getAllCurrencyInfo();
            if (currencyObject) {
                const cleanList = mapApiDataToCurrencies(currencyObject);
                console.log('Данные о всех курсах валют получены');
                setCurrencyList(cleanList);
            } else {
                console.error('Не удалось получить данные из API');
                setCurrencyList([]);
            }
        }

        setIsLoading(false);
    }

    const sortedCurrencyList = useMemo(() => {
        if (!currencyList.length) return [];
        return [...currencyList].sort((a: Currency, b: Currency) => {
            const aIsFav = favorites.includes(a.abbreviation);
            const bIsFav = favorites.includes(b.abbreviation);
            if (aIsFav === bIsFav) return 0;
            return aIsFav ? -1 : 1;
        });
    }, [currencyList, favorites]);

    return (
        <div>
            <div className="main-container">
                <div className="button-container">
                    <button className="btn" onClick={buttonShowCurrencyRatesOnClick}>
                        Курсы валют
                    </button>
                    <button className="btn" onClick={buttonShowConverterOnClick}>
                        Конвертер валют
                    </button>
                </div>
            </div>
            <div id="contentContainer" className="content-container">
                {renderContent()}
            </div>
        </div>
    );
}

export default App;
