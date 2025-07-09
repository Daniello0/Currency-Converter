import './App.css'
import './Content.css'
import {useState} from "react";

function App() {
    const [message, setMessage] = useState('');

    function buttonShowCurrencyRatesOnClick() {
        setMessage("Вы нажали на кнопку \"Курсы валют\"");
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
