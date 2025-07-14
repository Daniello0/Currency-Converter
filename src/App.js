import React, {useState} from "react";
import Parser from "./services/Parser";
import './mappers/CurrencyMapper';
import './components/RatesView';


import './App.css'
import './Content.css'
import {mapApiDataToCurrencies} from "./mappers/CurrencyMapper";
import RatesView from "./components/RatesView";
import Converter from "./services/Converter";
import ConverterView from "./components/ConverterView";

const parser = new Parser();
const converter = new Converter();

function App() {
    const [currencyList, setCurrencyList] = useState([]);
    const [activeView, setActiveView] = useState('none'); // 'none', 'rates', 'converter'
    const [isLoading, setIsLoading] = useState(false);

    // Помечаем функцию как асинхронную
    async function buttonShowCurrencyRatesOnClick() {
        console.log("Начало функции buttonShowCurrencyRatesOnClick()");

        await setActiveViewAndGetCurrencyList('rates');

        console.log("Конец функции buttonShowCurrencyRatesOnClick()");
    }

    async function buttonShowConverterOnClick() {
        console.log("Начало функции buttonShowConverterOnClick()");

        await setActiveViewAndGetCurrencyList('converter');

        console.log("Конец функции buttonShowConverterOnClick()");
    }

    const renderContent = () => {
        if (isLoading) {
            return <div className="loading-message">Загрузка...</div>;
        }

        switch (activeView) {
            case 'rates':
                return <RatesView rates={currencyList} />;
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

        const apiArray = await parser.parseRatesToArray();
        if (apiArray) {
            const cleanList = mapApiDataToCurrencies(apiArray);
            setCurrencyList(cleanList);
        } else {
            console.error("Не удалось получить данные из API");
            setCurrencyList([]);
        }

        setIsLoading(false);
    }

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
