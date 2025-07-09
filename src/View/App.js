import './App.css'
import './Content.css'
import '../Model/CurrencyRatesView'
import {useState} from "react";
import Parser from "../Model/Parser";
import {mapApiDataToCurrencies} from "../Model/CurrencyRatesList";

function App() {
    const [message, setMessage] = useState('');

    // Помечаем функцию как асинхронную
    async function buttonShowCurrencyRatesOnClick() {
        setMessage("Вы нажали на кнопку \"Курсы валют\"");

        const parser = new Parser();
        const apiArray = await parser.parseRatesToArray();
        if (apiArray) {
            console.log("Данные получены: ", apiArray);

            const currencyList = mapApiDataToCurrencies(apiArray);

            console.log("Преобразованный список:", currencyList);
        } else {
            console.error("Не удалось получить данные из API");
        }
    }

    function buttonShowConverterOnClick() {
        setMessage("Вы нажали на кнопку \"Конвертер валют\"");
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
              {message}
          </div>
      </div>
  );
}

export default App;
