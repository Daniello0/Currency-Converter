import React, {useState} from "react";
import Parser from "./services/Parser";
import './mappers/CurrencyMapper';
import './components/RatesView';


import './App.css'
import './Content.css'
import './components/RatesView'
import {mapApiDataToCurrencies} from "./mappers/CurrencyMapper";
import RatesView from "./components/RatesView";

const parser = new Parser();

function App() {
    const [currencyList, setCurrencyList] = useState([]);
    const [activeView, setActiveView] = useState('none'); // 'none', 'rates', 'converter'
    const [isLoading, setIsLoading] = useState(false);

    // Помечаем функцию как асинхронную
    async function buttonShowCurrencyRatesOnClick() {

        console.log("Начало функции buttonShowCurrencyRatesOnClick()");

        setIsLoading(true);
        setActiveView('rates');

        const apiArray = await parser.parseRatesToArray();
        if (apiArray) {
            const cleanList = mapApiDataToCurrencies(apiArray);
            setCurrencyList(cleanList); // Обновляем состояние с ДАННЫМИ
        } else {
            console.error("Не удалось получить данные из API");
            setCurrencyList([]); // В случае ошибки очищаем список
        }

        setIsLoading(false);

        console.log("Конец функции buttonShowCurrencyRatesOnClick()");
    }

    function buttonShowConverterOnClick() {
        setActiveView('converter');
    }

    const renderContent = () => {
        if (isLoading) {
            return <div className="loading-message">Загрузка...</div>;
        }

        switch (activeView) {
            case 'rates':
                return <RatesView rates={currencyList} />;
            case 'converter':
                return <h2>Конвертер в разработке...</h2>;
            default:
                return null;
        }
    };

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
