import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';

// A mock API function to simulate the back-end call to Gemini.
// In a real app, this would be a secure API endpoint on your server.
const mockGeminiPrediction = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // The response structure would be a JSON object from the back-end
      // that has already parsed the Gemini response.
      const mockApiResponse = {
        possibleMarriageDate: 'October 2025 to March 2026',
        possiblePartnerState: 'Based on astrological influences, the partner is likely to come from a state in the North-Eastern region, such as Assam or Meghalaya.',
        shortDescription: 'Based on the planetary positions in your horoscope, a significant transit of Jupiter and Venus is occurring, which is very auspicious for marriage. The 7th house, which governs marriage, is strong and well-aspected, indicating a period of great potential for a committed relationship. The location of your partner is influenced by the position of Venus and the 7th lord in the 12th house from your natal Moon, suggesting a partner from a different region, possibly to the east or north-east of your place of birth.',
        fullReportContent: 'This is a detailed, multi-page report content that would be used to generate a PDF. It includes: 1. Birth Chart Summary, 2. Planetary Positions, 3. Analysis of 7th house, 4. Dasha Analysis, 5. Transit Overview, 6. Marriage Time Window, 7. Likely States of Partner\'s Origin, 8. Suggestions. This content is a placeholder for the full response from the Gemini API.',
      };
      resolve(mockApiResponse);
    }, 2000); // Simulate network delay
  });
};

const Modal = ({ title, content, onClose }) => {
  return createPortal(
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-xl w-full m-4 transform transition-transform duration-300 scale-95 hover:scale-100" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-3xl">&times;</button>
        </div>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-300"
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
};

const App = () => {
  const [page, setPage] = useState('predictionForm');
  const [loading, setLoading] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [isPaidUser, setIsPaidUser] = useState(false); // Simulates user state
  const [isExistingUser, setIsExistingUser] = useState(false); // Simulates user state

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
  });

  const [resultData, setResultData] = useState(null);

  // Simulates city autocomplete data
  const citySuggestions = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
    'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
    'Dallas, TX', 'San Jose, CA', 'Mumbai, Maharashtra, India', 'Delhi, Delhi, India',
    'Bangalore, Karnataka, India', 'Kolkata, West Bengal, India', 'Chennai, Tamil Nadu, India'
  ];
  const [filteredCities, setFilteredCities] = useState([]);

  useEffect(() => {
    // This effect runs on component mount to simulate an existing user state.
    // In a real app, this would be determined by a user's session or token.
    const storedUserData = localStorage.getItem('userProfile');
    if (storedUserData) {
      const userProfile = JSON.parse(storedUserData);
      setFormData(userProfile.formData);
      setResultData(userProfile.resultData);
      setIsExistingUser(true);
      setIsPaidUser(userProfile.isPaid);

      // Check if the prediction date is within one month of the current date
      // This is a simplified check for demonstration purposes.
      const today = new Date();
      const lastPredictionDate = new Date(userProfile.lastPredictionDate);
      const diffInMonths = (today.getFullYear() - lastPredictionDate.getFullYear()) * 12 + today.getMonth() - lastPredictionDate.getMonth();
      if (diffInMonths < 1) {
        setPage('result');
      } else {
        setPage('predictionForm');
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Autocomplete logic for Place of Birth
    if (name === 'placeOfBirth' && value.length >= 3) {
      const filtered = citySuggestions.filter(city =>
        city.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  };

  const handleCitySelect = (city) => {
    setFormData({ ...formData, placeOfBirth: city });
    setFilteredCities([]);
  };

  const handleSubmitPrediction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultData(null); // Clear previous results

    try {
      // In a real application, a secure back-end endpoint would be called here.
      // e.g., await fetch('/api/predict', { method: 'POST', body: JSON.stringify(formData) })
      // We are using a mock function to simulate this.
      const result = await mockGeminiPrediction(formData);
      setResultData(result);
      setPage('result');

      // Simulating storing user data
      const userProfile = {
        formData,
        resultData: result,
        isPaid: isPaidUser,
        lastPredictionDate: new Date().toISOString()
      };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      setIsExistingUser(true);
    } catch (error) {
      setModalContent('An error occurred while fetching the prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetFullReport = () => {
    // In a real application, this would redirect to a payment page.
    setModalContent('You are now being redirected to the payment page via Razorpay. After a successful payment, the full report PDF will be sent to your email address.');
    // Simulate a redirect and successful payment.
    setTimeout(() => {
      setIsPaidUser(true);
      const userProfile = JSON.parse(localStorage.getItem('userProfile'));
      userProfile.isPaid = true;
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      setModalContent('Payment successful! The full report will be sent to your email shortly. You can now download your report from the results page.');
      setPage('result');
    }, 2000);
  };

  const handleDownloadReport = () => {
    if (resultData && isPaidUser) {
      setModalContent('Simulating PDF download... In a real app, the server would generate and send the PDF.');
    } else {
      setModalContent('Please get the full report first to enable this feature.');
    }
  };

  const renderPredictionForm = () => (
    <div className="flex-grow flex items-center justify-center p-4 min-h-screen">
      <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-lg transition-transform duration-500 transform hover:scale-105">
        <h2 className="text-4xl font-extrabold text-center text-purple-700 mb-6">Marriage Prediction</h2>
        <form onSubmit={handleSubmitPrediction} className="space-y-6">
          <div className="relative">
            <label htmlFor="fullName" className="block text-gray-700 font-semibold mb-2">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-300"
            />
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="block text-gray-700 font-semibold mb-2">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-300"
            />
          </div>
          <div>
            <label htmlFor="timeOfBirth" className="block text-gray-700 font-semibold mb-2">Time of Birth (AM/PM)</label>
            <input
              type="time"
              id="timeOfBirth"
              name="timeOfBirth"
              value={formData.timeOfBirth}
              onChange={handleInputChange}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-300"
            />
          </div>
          <div className="relative">
            <label htmlFor="placeOfBirth" className="block text-gray-700 font-semibold mb-2">Place of Birth</label>
            <input
              type="text"
              id="placeOfBirth"
              name="placeOfBirth"
              value={formData.placeOfBirth}
              onChange={handleInputChange}
              required
              autoComplete="off"
              className="w-full p-4 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-300"
            />
            {filteredCities.length > 0 && (
              <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto mt-2">
                {filteredCities.map((city, index) => (
                  <li
                    key={index}
                    onClick={() => handleCitySelect(city)}
                    className="p-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  >
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-purple-700 transition-colors duration-300 disabled:bg-gray-400"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Predicting...
              </div>
            ) : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderResultPage = () => (
    <div className="flex-grow flex items-center justify-center p-4 min-h-screen">
      <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-lg transition-transform duration-500 transform hover:scale-105">
        <h2 className="text-4xl font-extrabold text-center text-purple-700 mb-6">Your Prediction Result</h2>
        {resultData ? (
          <div className="space-y-6 text-gray-700">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Possible Marriage Date</h3>
              <p className="text-lg mt-2">{resultData.possibleMarriageDate}</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Possible Partner's State</h3>
              <p className="text-lg mt-2">{resultData.possiblePartnerState}</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Description</h3>
              <p className="text-lg mt-2 leading-relaxed">{resultData.shortDescription}</p>
            </div>
            {isPaidUser ? (
              <button
                onClick={handleDownloadReport}
                className="w-full py-4 px-6 bg-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-purple-700 transition-colors duration-300"
              >
                Download Report
              </button>
            ) : (
              <button
                onClick={handleGetFullReport}
                className="w-full py-4 px-6 bg-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-purple-700 transition-colors duration-300"
              >
                Get Full Report
              </button>
            )}
            <button
              onClick={() => setPage('predictionForm')}
              className="w-full py-4 px-6 mt-4 border border-purple-600 text-purple-600 font-bold text-lg rounded-xl hover:bg-purple-50 transition-colors duration-300"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p>No prediction data found. Please submit the form to get a result.</p>
            <button
              onClick={() => setPage('predictionForm')}
              className="mt-6 py-3 px-6 border border-purple-600 text-purple-600 font-bold text-lg rounded-xl hover:bg-purple-50 transition-colors duration-300"
            >
              Go Back to Form
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderMuhurathForm = () => (
    <div className="flex-grow flex items-center justify-center p-4 min-h-screen">
      <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-4xl transition-transform duration-500 transform hover:scale-105">
        <h2 className="text-4xl font-extrabold text-center text-purple-700 mb-6">Muhurath Form</h2>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Male Column */}
          <div className="flex-1 space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 text-center">Male</h3>
            <div>
              <label htmlFor="maleFullName" className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <input type="text" id="maleFullName" name="maleFullName" required className="w-full p-4 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-300" />
            </div>
            <div>
              <label htmlFor="maleDateOfBirth" className="block text-gray-700 font-semibold mb-2">Date of Birth</label>
              <input type="date" id="maleDateOfBirth" name="maleDateOfBirth" required className="w-full p-4 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-300" />
            </div>
            <div>
              <label htmlFor="maleTimeOfBirth" className="block text-gray-700 font-semibold mb-2">Time of Birth (AM/PM)</label>
              <input type="time" id="maleTimeOfBirth" name="maleTimeOfBirth" required className="w-full p-4 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-300" />
            </div>
            <div className="relative">
              <label htmlFor="malePlaceOfBirth" className="block text-gray-700 font-semibold mb-2">Place of Birth</label>
              <input type="text" id="malePlaceOfBirth" name="malePlaceOfBirth" required autoComplete="off" className="w-full p-4 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-300" />
            </div>
          </div>
          {/* Female Column */}
          <div className="flex-1 space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 text-center">Female</h3>
            <div>
              <label htmlFor="femaleFullName" className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <input type="text" id="femaleFullName" name="femaleFullName" required className="w-full p-4 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-300" />
            </div>
            <div>
              <label htmlFor="femaleDateOfBirth" className="block text-gray-700 font-semibold mb-2">Date of Birth</label>
              <input type="date" id="femaleDateOfBirth" name="femaleDateOfBirth" required className="w-full p-4 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-300" />
            </div>
            <div>
              <label htmlFor="femaleTimeOfBirth" className="block text-gray-700 font-semibold mb-2">Time of Birth (AM/PM)</label>
              <input type="time" id="femaleTimeOfBirth" name="femaleTimeOfBirth" required className="w-full p-4 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-300" />
            </div>
            <div className="relative">
              <label htmlFor="femalePlaceOfBirth" className="block text-gray-700 font-semibold mb-2">Place of Birth</label>
              <input type="text" id="femalePlaceOfBirth" name="femalePlaceOfBirth" required autoComplete="off" className="w-full p-4 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-300" />
            </div>
          </div>
        </div>
        <button
          onClick={() => setModalContent('This form would submit data for a joint prediction (Muhurath) to a back-end service.')}
          className="w-full mt-8 py-4 px-6 bg-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-purple-700 transition-colors duration-300"
        >
          Submit for Muhurath
        </button>
        <button
          onClick={() => setPage('predictionForm')}
          className="w-full py-4 px-6 mt-4 border border-purple-600 text-purple-600 font-bold text-lg rounded-xl hover:bg-purple-50 transition-colors duration-300"
        >
          Back to Prediction
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans antialiased text-gray-800 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col">
      <div className="container mx-auto p-4 flex-grow flex flex-col">
        <header className="flex justify-center md:justify-between items-center py-6 px-4">
          <h1 className="text-3xl font-bold text-purple-800 transition-transform duration-300 hover:scale-110">
            AstroPredict
          </h1>
          <nav className="hidden md:flex space-x-6 text-lg font-semibold">
            <button onClick={() => setPage('predictionForm')} className="text-purple-600 hover:text-purple-800 transition-colors duration-300">
              Prediction
            </button>
            <button onClick={() => setPage('muhurathForm')} className="text-purple-600 hover:text-purple-800 transition-colors duration-300">
              Muhurath
            </button>
          </nav>
        </header>

        {page === 'predictionForm' && renderPredictionForm()}
        {page === 'result' && renderResultPage()}
        {page === 'muhurathForm' && renderMuhurathForm()}

      </div>
      {modalContent && <Modal title="Information" content={modalContent} onClose={() => setModalContent(null)} />}
    </div>
  );
};

export default App;
