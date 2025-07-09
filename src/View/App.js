import './App.css'
import './Content.css'
import '../Model/CurrencyRatesView'
import {useState} from "react";
import Parser from "../Model/Parser";
import {mapApiDataToCurrencies} from "../Model/CurrencyMapper";
import RatesView from "../Model/CurrencyRatesView";

function App() {
    const [content, setContent] = useState(null);

    // Помечаем функцию как асинхронную
    async function buttonShowCurrencyRatesOnClick() {
        const parser = new Parser();
        const apiArray = await parser.parseRatesToArray();
        if (apiArray) {
            console.log("Данные получены: ", apiArray);

            const currencyList = mapApiDataToCurrencies(apiArray);

            console.log("Преобразованный список:", currencyList);

            const ratesViewComponent = <RatesView rates={currencyList} />;

            await setContent(ratesViewComponent);
        } else {
            console.error("Не удалось получить данные из API");
        }
    }

    function buttonShowConverterOnClick() {
        setContent("Конвертер в разработке...");
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
              {content}
          </div>
      </div>
  );
}

export default App;
