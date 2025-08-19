import React, {useEffect, useMemo, useState} from "react";
import Parser from "./services/Parser.js";
import './mappers/CurrencyMapper.js';
import './components/RatesView.js';


import './App.css'
import './Content.css'
import {mapApiDataToCurrencies} from "./mappers/CurrencyMapper.js";
import RatesView from "./components/RatesView.js";
import Converter from "./services/Converter.js";
import ConverterView from "./components/ConverterView.js";
import ServerController from "./services/ServerController.js";
const converter = new Converter();

function App() {
    const [currencyList, setCurrencyList] = useState([]);
    const [activeView, setActiveView] = useState('none'); // 'none', 'rates', 'converter'
    const [isLoading, setIsLoading] = useState(true);
    const [favorites, setFavorites] = useState(() => {
        try {
            const savedFavorites = localStorage.getItem('favoriteCurrencies');
            return savedFavorites ? JSON.parse(savedFavorites) : [];
        } catch (error) {
            console.error("Ошибка при чтении favorites из localStorage:", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('favoriteCurrencies', JSON.stringify(favorites));
        } catch (error) {
            console.error("Ошибка при сохранении favorites в localStorage:", error);
        }
    }, [favorites]);

    const toggleFavorite = (currencyCode) => {
        setFavorites(prevFavorites => {
            const newFavorites = new Set(prevFavorites);
            if (newFavorites.has(currencyCode)) {
                newFavorites.delete(currencyCode);
            } else {
                newFavorites.add(currencyCode);
            }
            return Array.from(newFavorites);
        });
    };

    useEffect(() => {
        setActiveViewAndGetCurrencyList('rates').then();
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
                return <RatesView
                    rates = {sortedCurrencyList}
                    favorites = {favorites}
                    onToggleFavorite = {toggleFavorite}
                />;
            case 'converter': {
                return <ConverterView rates={currencyList} converter={converter} />;
            }
            default:
                return null;
        }
    };

    async function setActiveViewAndGetCurrencyList(activeViewName) {
        setIsLoading(true);
        setActiveView(activeViewName);

        const currencyObject = await ServerController.getAllCurrencyInfo();
        if (currencyObject) {
            const cleanList = mapApiDataToCurrencies(currencyObject);
            setCurrencyList(cleanList);
        } else {
            console.error("Не удалось получить данные из API");
            setCurrencyList([]);
        }

        setIsLoading(false);
    }

    const sortedCurrencyList = useMemo(() => {
        if (!currencyList.length) return [];
        return [...currencyList].sort((a, b) => {
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
                  <button className="btn" onClick={buttonShowCurrencyRatesOnClick}>Курсы валют</button>
                  <button className="btn" onClick={buttonShowConverterOnClick}>Конвертер валют</button>
              </div>
          </div>
          <div id="contentContainer" className="content-container">
              {renderContent()}
          </div>
      </div>
  );
}

export default App;
