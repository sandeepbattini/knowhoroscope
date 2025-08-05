import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// This is the main component of our application.
const App = () => {
  // State variables for user inputs and application status
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    email: '',
    gender: '',
  });
  const [astrologyReading, setAstrologyReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showReportDownload, setShowReportDownload] = useState(false);
  const [showReadingPopup, setShowReadingPopup] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  // Load the Razorpay script dynamically and set the document title
  useEffect(() => {
    // Set the document title
    document.title = "From Horoscope";

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('Razorpay script loaded successfully.');
      setIsRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script.');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handler for form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Function to call the Gemini API and get the astrological reading
  const getAstrologyReading = async (e) => {
    e.preventDefault(); // Prevent form submission and page reload

    // IMPORTANT: You must get your own API key from Google AI Studio.
    // Paste your key inside the quotes below. For example: const apiKey = "AIza...";
    const apiKey = "AIzaSyBp6mXrEoWHWAb57ulh8WXbfDLqA4asUwg"; 

    if (!formData.name || !formData.birthDate || !formData.birthTime || !formData.birthPlace || !formData.gender) {
      setMessage('Please fill in all birth details, including gender, to get the astrology reading.');
      return;
    }

    if (!apiKey) {
      setMessage('Please add your Gemini API key to the code to enable this feature.');
      return;
    }

    setMessage('Generating a personalized astrology reading with Gemini...');
    setLoading(true);

    const prompt = `Based on the following birth details, provide a brief, poetic astrological reading about the individual's future romantic and marriage life. The reading should be based on common astrological interpretations, but be presented in a descriptive, narrative style. Avoid providing a specific date. Instead, suggest a general time frame (e.g., "in the coming years," "a period of growth," "after a major life change").

    Name: ${formData.name}
    Date of Birth: ${formData.birthDate}
    Time of Birth: ${formData.birthTime}
    Place of Birth: ${formData.birthPlace}
    Gender: ${formData.gender}
    
    The response should be 2-3 short paragraphs and be a positive, insightful narrative.`;

    try {
      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        setAstrologyReading(text.trim());
        setMessage('Your personalized reading is ready!');
        setShowReadingPopup(true);
      } else {
        setAstrologyReading(null);
        setMessage('Could not generate a reading. Please try again.');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setMessage('An error occurred while connecting to the AI model. Please check your API key and network connection.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle the Razorpay payment
  const handlePayment = () => {
    if (!isRazorpayLoaded) {
      setMessage('Payment system not ready. Please wait a moment and try again.');
      return;
    }
    if (!formData.email) {
      setMessage('Please enter your email to proceed with the payment.');
      return;
    }

    setMessage('Initiating payment...');
    
    // NOTE: For a real application, the order ID should be created on a secure backend server.
    // The amount should also be handled on the server to prevent manipulation.
    const options = {
      key: 'rzp_test_XXXXXXXXXXXXXXXX', // Replace with your actual Test Key
      amount: '5100', // Amount in paisa. 5100 paisa = Rs. 51
      currency: 'INR',
      name: 'From Horoscope',
      description: 'Detailed Astrology Report',
      handler: function (response) {
        console.log('Payment successful:', response);
        setMessage('Payment successful! Your detailed report will be generated.');
        
        setShowReportDownload(true);
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: '',
      },
      notes: {
        address: 'From Horoscope Office',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  // Function to generate and download a dummy PDF
  const downloadReport = () => {
    const reportContent = `
From Horoscope Detailed Report

Name: ${formData.name}
Date of Birth: ${formData.birthDate}
Time of Birth: ${formData.birthTime}
Place of Birth: ${formData.birthPlace}
Gender: ${formData.gender}

Astrology Reading: 
${astrologyReading || 'Not available'}

This is a sample report. A full report would include detailed astrological charts and predictions.
`;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `horoscope_report_${formData.name.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage('Report downloaded!');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 sm:p-8 space-y-8">
        <h1 className="text-3xl font-extrabold text-center text-gray-800">From Horoscope</h1>

        <form className="grid grid-cols-1 sm:grid-cols-2 gap-6" onSubmit={getAstrologyReading}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              placeholder="Your Name"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="birthTime" className="block text-sm font-medium text-gray-700">Time of Birth</label>
            <input
              type="time"
              id="birthTime"
              name="birthTime"
              value={formData.birthTime}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700">Place of Birth</label>
            <input
              type="text"
              id="birthPlace"
              name="birthPlace"
              value={formData.birthPlace}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              placeholder="City, Country"
              list="cities"
              required
            />
            <datalist id="cities">
                <option value="New Delhi, India" />
                <option value="Mumbai, India" />
                <option value="Bangalore, India" />
                <option value="New York, USA" />
                <option value="London, UK" />
                <option value="Tokyo, Japan" />
                <option value="Sydney, Australia" />
            </datalist>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <div className="flex items-center space-x-4">
              <label htmlFor="gender-male" className="flex items-center">
                <input
                  type="radio"
                  id="gender-male"
                  name="gender"
                  value="Male"
                  checked={formData.gender === 'Male'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  required
                />
                <span className="ml-2 text-sm text-gray-700">Male</span>
              </label>
              <label htmlFor="gender-female" className="flex items-center">
                <input
                  type="radio"
                  id="gender-female"
                  name="gender"
                  value="Female"
                  checked={formData.gender === 'Female'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  required
                />
                <span className="ml-2 text-sm text-gray-700">Female</span>
              </label>
            </div>
          </div>
        </form>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="submit"
            form="form"
            onClick={getAstrologyReading}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Get Astrology Reading'}
          </button>
          
          <button
            onClick={handlePayment}
            disabled={!isRazorpayLoaded}
            className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            Get Detailed Report (₹51)
          </button>
        </div>

        {message && (
          <div className="mt-6 p-4 rounded-md text-center bg-blue-50 border-l-4 border-blue-400">
            <p className="text-sm text-blue-700">{message}</p>
          </div>
        )}

        {showReportDownload && (
          <div className="mt-6 flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold text-gray-800">Report Ready!</h2>
            <p className="mt-2 text-gray-600 text-center">Your detailed report is ready for download.</p>
            <button
              onClick={downloadReport}
              className="mt-4 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Download Report
            </button>
          </div>
        )}

        {/* The pop-up window for the astrology reading */}
        {showReadingPopup && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
            <div className="relative p-8 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg max-h-[90vh] flex flex-col">
              <button
                onClick={() => setShowReadingPopup(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
              <div className="text-center flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-800">Your Astrology Reading</h2>
              </div>
              <div className="mt-4 p-4 rounded-md bg-yellow-50 border-l-4 border-yellow-400 overflow-y-auto flex-grow">
                <p className="text-sm font-medium text-yellow-700">Your Reading:</p>
                <p className="mt-1 text-lg font-normal text-yellow-800 whitespace-pre-wrap">{astrologyReading}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// We use createRoot to render the App component into the root DOM element.
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);


export default App;
