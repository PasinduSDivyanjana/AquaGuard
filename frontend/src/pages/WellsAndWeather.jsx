import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CloudRain, Wind, Thermometer, MapPin, AlertTriangle, Droplet } from 'lucide-react';
import toast from 'react-hot-toast';

export const WellsAndWeather = () => {
  const { user } = useContext(AuthContext);
  const [wells, setWells] = useState([]);
  const [selectedWell, setSelectedWell] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWells, setLoadingWells] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [generatingAlert, setGeneratingAlert] = useState(false);

  useEffect(() => {
    fetchWells();
  }, []);

  const fetchWells = async () => {
    try {
      setLoadingWells(true);
      const res = await axios.get('/api/environment/wells');
      setWells(res.data);
      if (res.data.length > 0) {
        handleSelectWell(res.data[0]);
      }
    } catch (err) {
      toast.error('Failed to load wells');
    } finally {
      setLoadingWells(false);
    }
  };

  const handleSelectWell = async (well) => {
    setSelectedWell(well);
    try {
      setLoadingWeather(true);
      const res = await axios.get(`/api/environment/weather/${well._id}`);
      setWeatherData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load weather data');
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleGenerateAlert = async () => {
    if (!selectedWell) return;
    try {
      setGeneratingAlert(true);
      const res = await axios.post(`/api/alerts/well/${selectedWell._id}`);
      if (res.data.alert) {
        toast.success('Alert generated successfully for this well!');
        if (res.data.autoTask) {
          setTimeout(() => {
            toast.success('AI Predictive Task also created automatically! Review it in the Auto Tasks page.', { duration: 5000 });
          }, 800);
        }
      } else {
        toast('Weather conditions are normal. No alert needed.', { icon: '✅' });
      }
    } catch (err) {
      toast.error('Failed to generate alert');
    } finally {
      setGeneratingAlert(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center glass p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center mb-1">
            <CloudRain className="w-6 h-6 mr-3 text-aqua" />
            Environment Monitoring
          </h1>
          <p className="text-gray-400 text-sm">Real-time weather data and well status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Wells List */}
        <div className="glass p-6 rounded-2xl h-[calc(100vh-220px)] flex flex-col">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-aqua" />
            Active Wells
          </h2>
          {loadingWells ? (
            <div className="flex justify-center p-10"><div className="animate-spin w-6 h-6 border-2 border-aqua border-t-transparent rounded-full"></div></div>
          ) : wells.length === 0 ? (
            <div className="text-gray-500 text-center py-10">No wells found in database</div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {wells.map(well => (
                <button
                  key={well._id}
                  onClick={() => handleSelectWell(well)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedWell?._id === well._id
                    ? 'bg-aqua/10 border-aqua text-gray-100 shadow-[0_0_10px_rgba(0,247,255,0.1)]'
                    : 'bg-dark-bg/50 border-dark-border text-gray-400 hover:bg-dark-bg'
                    }`}
                >
                  <p className="font-semibold">{well.name || 'Unnamed Well'}</p>
                  <p className="text-xs mt-1 font-mono opacity-60 flex justify-between">
                    <span>{well.location?.lat.toFixed(4)}</span>
                    <span>{well.location?.lng.toFixed(4)}</span>
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Weather Data & Alert Trigger */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-8 rounded-2xl min-h-[300px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -z-10"></div>

            {loadingWeather ? (
              <div className="h-full flex flex-col justify-center items-center py-20 text-aqua">
                <div className="animate-spin w-10 h-10 border-4 border-current border-t-transparent rounded-full mb-4"></div>
                Analyzing Environment...
              </div>
            ) : weatherData ? (
              <div className="animate-fade-in relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-100 mb-2">{selectedWell?.name}</h2>
                    <p className="text-gray-400 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {weatherData.fetchedAt ? `Last Updated: ${new Date(weatherData.fetchedAt).toLocaleString()}` : 'Live Environment Data'}
                    </p>
                  </div>

                  {/* Generate Alert Button for Officers/Admins */}
                  {(user?.role === 'officer' || user?.role === 'admin') && (
                    <button
                      onClick={handleGenerateAlert}
                      disabled={generatingAlert}
                      className="glass-button bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] px-6 py-3 rounded-xl flex items-center font-bold disabled:opacity-50"
                    >
                      {generatingAlert ? (
                        <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      ) : (
                        <AlertTriangle className="w-5 h-5 mr-2" />
                      )}
                      {generatingAlert ? 'Scanning...' : 'Check & Generate Alert'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Temperature */}
                  <div className="bg-dark-bg/60 border border-dark-border p-6 rounded-2xl flex items-center">
                    <div className="bg-orange-500/20 p-4 rounded-full mr-4">
                      <Thermometer className="w-8 h-8 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Temperature</p>
                      <p className="text-2xl font-bold text-gray-100 whitespace-nowrap">{weatherData.temperature}&nbsp;°C</p>
                    </div>
                  </div>

                  {/* Humidity */}
                  <div className="bg-dark-bg/60 border border-dark-border p-6 rounded-2xl flex items-center">
                    <div className="bg-aqua/20 p-4 rounded-full mr-4">
                      <Droplet className="w-8 h-8 text-aqua" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Humidity</p>
                      <p className="text-2xl font-bold text-gray-100 whitespace-nowrap">{weatherData.humidity}&nbsp;%</p>
                    </div>
                  </div>

                  {/* Rainfall */}
                  <div className="bg-dark-bg/60 border border-dark-border p-6 rounded-2xl flex items-center">
                    <div className="bg-blue-400/20 p-4 rounded-full mr-4">
                      <CloudRain className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Rainfall</p>
                      <p className="text-2xl font-bold text-gray-100 whitespace-nowrap">{weatherData.rainfall}&nbsp;mm</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center py-20 text-gray-500">
                <MapPin className="w-16 h-16 mb-4 opacity-20" />
                Select a well from the list to view environmental data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
