const apiKey = 'f2808c894d0711d87f9a1461eee6051e';
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherInfo = document.getElementById('weather-info');

searchBtn.addEventListener('click', () => {
    const cityName = cityInput.value.trim();
    if (cityName) {
        getWeatherData(cityName);
    }
});

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const cityName = cityInput.value.trim();
        if (cityName) {
            getWeatherData(cityName);
        }
    }
});

async function getWeatherData(city) {
    weatherInfo.innerHTML = '<p>Загрузка данных...</p>';

    try {
        // Получаем текущую погоду через /weather (доступно в бесплатной подписке)
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ru`);
        if (!response.ok) {
            throw new Error('Город не найден или ошибка запроса');
        }
        const data = await response.json();
        displayCurrentWeather(data);
    } catch (error) {
        weatherInfo.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}

function formatTimeUnix(unixSeconds, timezoneOffset = 0) {
    // timezoneOffset из ответа OpenWeather в секундах; применяем для корректного локального времени города
    const date = new Date((unixSeconds + timezoneOffset) * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function displayCurrentWeather(data) {
    weatherInfo.innerHTML = '';

    const cityName = `${data.name}${data.sys && data.sys.country ? ', ' + data.sys.country : ''}`;
    const header = document.createElement('h2');
    header.textContent = `Погода сейчас: ${cityName}`;
    weatherInfo.appendChild(header);

    const main = data.main || {};
    const wind = data.wind || {};
    const weather = Array.isArray(data.weather) && data.weather[0] ? data.weather[0] : null;
    const sys = data.sys || {};
    const timezone = typeof data.timezone === 'number' ? data.timezone : 0;

    const container = document.createElement('div');
    container.classList.add('current-weather');

    container.innerHTML = `
        <div class="row"><strong>Температура:</strong> ${main.temp != null ? Math.round(main.temp) + '°C' : '—'}</div>
        <div class="row"><strong>Ощущается как:</strong> ${main.feels_like != null ? Math.round(main.feels_like) + '°C' : '—'}</div>
        <div class="row"><strong>Описание:</strong> ${weather ? weather.description : '—'}</div>
        <div class="row"><strong>Влажность:</strong> ${main.humidity != null ? main.humidity + '%' : '—'}</div>
        <div class="row"><strong>Давление:</strong> ${main.pressure != null ? main.pressure + ' hPa' : '—'}</div>
        <div class="row"><strong>Ветер:</strong> ${wind.speed != null ? wind.speed + ' м/с' : '—'} ${wind.deg != null ? '(' + wind.deg + '°)' : ''}</div>
        <div class="row"><strong>Облачность:</strong> ${data.clouds && data.clouds.all != null ? data.clouds.all + '%' : '—'}</div>
        <div class="row"><strong>Видимость:</strong> ${data.visibility != null ? data.visibility + ' м' : '—'}</div>
        <div class="row"><strong>Восход:</strong> ${sys.sunrise ? formatTimeUnix(sys.sunrise, timezone) : '—'}</div>
        <div class="row"><strong>Заход:</strong> ${sys.sunset ? formatTimeUnix(sys.sunset, timezone) : '—'}</div>
    `;

    weatherInfo.appendChild(container);
}
