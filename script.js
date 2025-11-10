// Weather Dashboard - script.js
// NOTE: Replace the placeholder with your OpenWeather API key (see README.md)
// Weather Dashboard - script.js
// API key handling:
// - For development, create a local `config.js` that sets `window.OPENWEATHER_API_KEY` (see README).
// - If that global isn't present, set the string below (not recommended for public repos).
const API_KEY = window.OPENWEATHER_API_KEY || 'YOUR_OPENWEATHER_API_KEY';
// If you deploy to Netlify and want to hide the API key, set window.USE_NETLIFY_PROXY = true
// locally or enable proxy usage in the deployed site. When true the app will call
// '/.netlify/functions/weather?city=...'
const USE_NETLIFY_PROXY = !!window.USE_NETLIFY_PROXY;
const BASE = 'https://api.openweathermap.org/data/2.5/weather';

const $ = id => document.getElementById(id);
const input = $('city-input');
const btn = $('search-btn');
const loader = $('loader');
const card = $('card');
const msg = $('msg');

const els = {
  location: $('location'),
  temp: $('temp'),
  desc: $('desc'),
  icon: $('icon'),
  feels: $('feels'),
  humidity: $('humidity'),
  wind: $('wind')
};

function showLoader(show){ loader.classList.toggle('hidden', !show); }
function showCard(show){ card.classList.toggle('hidden', !show); }
function showMsg(text){ msg.textContent = text; msg.classList.toggle('hidden', !text); }

function cacheSet(city, data){
  const entry = { ts: Date.now(), data };
  try{ localStorage.setItem('weather_cache_'+city.toLowerCase(), JSON.stringify(entry)); }catch(e){}
}
function cacheGet(city, maxMs=10*60*1000){
  try{
    const raw = localStorage.getItem('weather_cache_'+city.toLowerCase());
    if(!raw) return null;
    const entry = JSON.parse(raw);
    if(Date.now() - entry.ts > maxMs) return null;
    return entry.data;
  }catch(e){ return null }
}

async function fetchWeather(city){
  if(!city) return null;
  const cached = cacheGet(city);
  if(cached) return cached;

  let url;
  if(USE_NETLIFY_PROXY){
    url = `/.netlify/functions/weather?city=${encodeURIComponent(city)}`;
  } else {
    url = `${BASE}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
  }
  const res = await fetch(url);
  // Try to read JSON body for helpful error messages
  const body = await res.json().catch(() => null);
  if(!res.ok){
    const detail = body && body.message ? body.message : res.statusText || 'Failed to fetch';
    const err = new Error(detail);
    // attach status for more specific handling downstream
    err.status = res.status;
    throw err;
  }
  const data = body;
  cacheSet(city, data);
  return data;
}

function render(data){
  if(!data) return;
  const name = `${data.name}, ${data.sys && data.sys.country ? data.sys.country : ''}`.trim();
  els.location.textContent = name;
  els.temp.textContent = `${Math.round(data.main.temp)}°C`;
  els.desc.textContent = data.weather[0].description;
  els.icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  els.icon.alt = data.weather[0].description;
  els.feels.textContent = `${Math.round(data.main.feels_like)}°C`;
  els.humidity.textContent = `${data.main.humidity}%`;
  els.wind.textContent = `${Math.round(data.wind.speed)} m/s`;
  // show
  showMsg('');
  showCard(true);
}

async function doSearch(city){
  showCard(false);
  showMsg('');
  if(!city){ showMsg('Please enter a city name.'); return; }
  showLoader(true);
  try{
    const data = await fetchWeather(city);
    render(data);
  }catch(err){
    console.error('fetchWeather error:', err);
    // Give clearer, actionable messages depending on the HTTP status
    if(err && err.status === 401){
      showMsg('Invalid or missing API key. Open `script.js` and set your OpenWeather API key (see README).');
    } else if(err && err.status === 404){
      showMsg('City not found. Try a different city or check spelling.');
    } else if(err && err.status === 429){
      showMsg('Rate limit exceeded. Please wait a while and try again.');
    } else if(err && err.message){
      showMsg('Error: ' + err.message);
    } else {
      showMsg('Could not find weather for "'+city+'". Try a different city.');
    }
  }finally{
    showLoader(false);
  }
}

// Simple debounce so typing doesn't hammer API
function debounce(fn, wait=600){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait)} }

const debouncedSearch = debounce(()=> doSearch(input.value.trim()), 600);

// Events
btn.addEventListener('click', ()=> doSearch(input.value.trim()));
input.addEventListener('input', ()=> debouncedSearch());
input.addEventListener('keypress', (e)=>{ if(e.key==='Enter') doSearch(input.value.trim()); });

// On load: try a default city (optional)
window.addEventListener('load', ()=>{
  const defaultCity = 'New York';
  input.value = '';
  // don't auto-run; let the user search to avoid unexpected API calls
});
