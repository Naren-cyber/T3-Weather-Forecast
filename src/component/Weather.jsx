import { useEffect, useRef, useState } from 'react';
import './Weather.css';
import search_icon from '../assets/search.png';
import clear_icon from '../assets/clear.png';
import cloud_icon from '../assets/cloud.png';
import drizzle_icon from '../assets/drizzle.png';
import rain_icon from '../assets/rain.png';
import wind_icon from '../assets/wind.png';
import humidity_icon from '../assets/humidity.png';
import snow_icon from '../assets/snow.png';

//Import necessary hooks from React

const Weather = () => {

    //useRef is used to access the input element directly
    const inputRef = useRef();
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState([]);
    const [unit, setUnit] = useState('metric');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

//// Mapping of weather icons from API to custom icons

    const allIcons = {
        "01d": clear_icon,
        "01n": clear_icon,
        "02d": cloud_icon,
        "02n": cloud_icon,
        "03n": cloud_icon,
        "03d": cloud_icon,
        "04d": drizzle_icon,
        "04n": drizzle_icon,
        "09d": rain_icon,
        "09n": rain_icon,
        "10d": rain_icon,
        "10n": rain_icon,
        "13d": snow_icon,
        "13n": snow_icon,
    };

    //// Function to fetch weather and forecast data based on city name

    const search = async (city) => {
        if (city === "") {
            alert("Enter city Name");
            return;
        }

        // Start loading and clear previous errors

        setLoading(true);
        setError('');
        try {

            // Construct URLs for fetching current weather and forecast data

            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${import.meta.env.VITE_APP_ID}`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${import.meta.env.VITE_APP_ID}`;

            const weatherResponse = await fetch(weatherUrl);
            const weatherData = await weatherResponse.json();

            const forecastResponse = await fetch(forecastUrl);
            const forecastData = await forecastResponse.json();

            if (!weatherResponse.ok || !forecastResponse.ok) {
                setError(weatherData.message || 'Error fetching forecast data');
                return;
            }

            const icon = allIcons[weatherData.weather[0].icon] || clear_icon;
           
           // Get the appropriate icon based on the weather data
           
            setWeatherData({
                humidity: weatherData.main.humidity,
                windspeed: weatherData.wind.speed,
                temperature: Math.floor(weatherData.main.temp),
                location: weatherData.name,
                icon: icon,
                description: weatherData.weather[0].description,
                minTemp: Math.floor(weatherData.main.temp_min),
                maxTemp: Math.floor(weatherData.main.temp_max),
            });

            // Filter and map forecast data to show one entry per day (every 8th entry)

            const filteredForecast = forecastData.list.filter((item, index) => index % 8 === 0).map(item => ({
                date: item.dt_txt.split(' ')[0],
                avgTemp: Math.floor(item.main.temp),
                description: item.weather[0].description,
                icon: allIcons[item.weather[0].icon] || clear_icon
            }));

            // Set the forecast data in the state

            setForecastData(filteredForecast);

        } catch  {

             // If an error occurs during fetching, set the error message
           
             setError('Error in fetching weather data');
        } finally {

             // Stop loading once data is fetched

            setLoading(false);
        }
    };

    // Function to toggle between metric and imperial units

    const toggleUnit = () => {
        setUnit(prevUnit => (prevUnit === 'metric' ? 'imperial' : 'metric'));
    };

    // useEffect hook to trigger a search when the component mounts or when the unit changes

    useEffect(() => {
        search(inputRef?.current?.value||'Delhi');
    }, [unit]);

     // JSX structure of the component

    return (
        <div className='weather'>
            <div className='search-bar'>
                <input ref={inputRef} type='text' placeholder='Search city...' />
                <img src={search_icon} alt='Search' onClick={() => search(inputRef.current.value)} />
                <button onClick={toggleUnit}>
                    {unit === 'metric' ? 'Switch to °F' : 'Switch to °C'}
                </button>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className='error'>{error}</p>
            ) : weatherData ? (
                <div>
                    <div className='current-weather'>
                        <img src={weatherData.icon} alt='Weather icon' className='weather-icon' />
                        <p className='temperature'>
                            {weatherData.temperature}°{unit === 'metric' ? 'C' : 'F'}
                        </p>
                        <p className='location'>{weatherData.location}</p>
                        <p className='description'>{weatherData.description}</p>
                        <p>Min: {weatherData.minTemp}°{unit === 'metric' ? 'C' : 'F'}, Max: {weatherData.maxTemp}°{unit === 'metric' ? 'C' : 'F'}</p>
                        <div className='weather-data'>
                            <div className='col'>
                                <img src={humidity_icon} alt='Humidity' />
                                <div>
                                    <p>{weatherData.humidity}%</p>
                                    <span>Humidity</span>
                                </div>
                            </div>
                            <div className='col'>
                                <img src={wind_icon} alt='Wind speed' />
                                <div>
                                    <p>{weatherData.windspeed} {unit === 'metric' ? 'Km/h' : 'Mph'}</p>
                                    <span>Wind Speed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='forecast'>
                        <h3>5-Day Forecast</h3>
                        <div className='forecast-container'>
                            {forecastData.map((day, index) => (
                                <div key={index} className='forecast-item'>
                                    <p>{day.date}</p>
                                    <img src={day.icon} height={24} alt='Weather icon' />
                                    <p>{day.avgTemp}°{unit === 'metric' ? 'C' : 'F'}</p>
                                    <p>{day.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <p>No data available</p>
            )}
        </div>
    );
};

//// Export the Weather component as default

export default Weather;
