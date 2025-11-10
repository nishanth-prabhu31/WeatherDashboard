# Weather Dashboard

A simple, responsive Weather Dashboard built with plain HTML, CSS and JavaScript using the OpenWeather API. Minimal stack and designed for local development.

## What you get

- `index.html` — main UI
- `style.css` — responsive styling
- `script.js` — fetches current weather from OpenWeather and displays it

## Setup (local development)

1. Get a free OpenWeather API key:
   - Create an account at https://openweathermap.org/
   - Go to API keys and copy your key.

2. Create a `config.js` file in the project root (next to `index.html`) with this content (DO NOT commit this file):

```js
// config.js (local only - add to .gitignore)
window.OPENWEATHER_API_KEY = 'YOUR_REAL_API_KEY_HERE';
// optional: if you later use a Netlify proxy, set this to true locally
// window.USE_NETLIFY_PROXY = false;
```

I included `config.example.js` you can copy and edit. The app reads `window.OPENWEATHER_API_KEY` at runtime.

## Run locally

Open `index.html` in your browser (double-click). No build step required.

For a local server (recommended for correct MIME serving):

On Windows (cmd.exe) with Python installed:

```cmd
python -m http.server 5500
```

Then visit http://localhost:5500 in your browser.

## Notes & improvements

- Caching: the app caches recent city results in localStorage for ~10 minutes to reduce API calls and reduce lag.
- Debounce: the search input is debounced to avoid too many requests while typing.
- Next steps: add forecast, local geolocation, and (optionally) a serverless proxy to hide the API key for production..



