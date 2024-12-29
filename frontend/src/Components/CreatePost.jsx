import React, { useState,useEffect } from 'react';
import { Image, Smile, MapPin, X, Loader2, AlertCircle, Search } from 'lucide-react';

const PAKISTAN_CITIES = [
  { city: "Karachi", region: "Sindh" },
  { city: "Lahore", region: "Punjab" },
  { city: "Islamabad", region: "Federal Capital" },
  { city: "Rawalpindi", region: "Punjab" },
  { city: "Faisalabad", region: "Punjab" },
  { city: "Multan", region: "Punjab" },
  { city: "Peshawar", region: "KPK" },
  { city: "Quetta", region: "Balochistan" },
  { city: "Sialkot", region: "Punjab" },
  { city: "Gujranwala", region: "Punjab" },
].sort((a, b) => a.city.localeCompare(b.city));

const EMOJI_LIST = [
    "😊", "👍", "❤️", "🎉", "🔥", "😂", "🙌", "✨", "💪", "🎈",
    
    "🥰", "😎", "🤔", "😅", "😍", "🤗", "😮", "🥳", "😌", "🤩",
    
    "👋", "🤝", "✌️", "👊", "🙏", "👏", "🤟", "💅", "🤘", "👆",
    
    "💖", "💕", "💝", "💓", "💗", "💜", "💙", "💚", "🧡", "🤎",
    
    "🌟", "🌙", "☀️", "🌈", "🌺", "🌸", "🍀", "⭐", "🌊", "❄️",
    
    "📱", "💯", "⚡", "💡", "🎵", "🎨", "📸", "🎁", "🏆", "💫"
];
// Cloudinary configuration
const CLOUDINARY_CONFIG = {
  UPLOAD_PRESET: 'mp0lss73',
  CLOUD_NAME: 'dvy9uip4w',
};

const Alert = ({ title, message, onClose }) => (
  <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-lg flex items-start space-x-2">
    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
    <div className="flex-1">
      <h4 className="text-red-800 font-medium">{title}</h4>
      <p className="text-red-600 text-sm">{message}</p>
    </div>
    <button onClick={onClose} className="text-red-500 hover:text-red-700">
      <X className="h-4 w-4" />
    </button>
  </div>
);

const LocationPicker = ({ onSelect, darkMode, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCities, setFilteredCities] = useState(PAKISTAN_CITIES);

  useEffect(() => {
    const filtered = PAKISTAN_CITIES.filter(({ city, region }) =>
      city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      region.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [searchTerm]);

  return (
    <div className={`absolute top-12 left-0 ${
      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
    } border rounded-lg shadow-lg w-64 z-20`}>
      <div className="p-2 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-8 pr-4 py-2 rounded-md text-sm ${
              darkMode 
                ? 'bg-gray-600 text-white placeholder-gray-400 border-gray-600' 
                : 'bg-gray-50 text-gray-900 placeholder-gray-500 border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {filteredCities.map(({ city, region }) => (
          <button
            key={city}
            onClick={() => {
              onSelect(`${city}, ${region}`);
              onClose();
            }}
            className={`w-full text-left px-4 py-2 text-sm ${
              darkMode 
                ? 'hover:bg-gray-600 text-gray-200' 
                : 'hover:bg-gray-50 text-gray-700'
            } flex justify-between items-center`}
          >
            <span>{city}</span>
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {region}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const CreatePost = ({ onPost, darkMode = false }) => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleEmojiClick = (emoji) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
    setShowLocationPicker(false);
  };

  const handleMediaUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      setMedia({
        url: data.secure_url,
        type: file.type.startsWith('image/') ? 'image' : 'video'
      });
    } catch (err) {
      console.error('Media upload error:', err);
      setError("Failed to upload media. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      const postData = {
        content: content.trim(),
        timestamp: new Date().toISOString()
      };

      if (location) {
        postData.location = location;
      }

      if (media) {
        postData.media = {
          url: media.url,
          type: media.type
        };
      }
      const generateUniqueId = () => {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      };
      const uniqueId = generateUniqueId();
      postData.uniqueId = uniqueId;

      const cookie = localStorage.getItem("token")

      if (cookie) {
        postData['user_.id'] = cookie;
      }

      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create post');
      }

      const createdPost = await response.json();
      onPost(createdPost);

      // Reset form
      setContent("");
      setMedia(null);
      setLocation(null);
      setShowEmojiPicker(false);
      setShowLocationPicker(false);
    } catch (err) {
      console.error('Post creation error:', err);
      setError(err.message || "Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl p-4 shadow-md`}>
      {error && (
        <Alert
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
        <img
  src={`https://api.dicebear.com/6.x/avataaars/svg?seed=2994200&radius=50`}
  alt="User avatar"
/>
        </div>

        <div className="flex-1">
          <textarea
            className={`w-full ${
              darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white placeholder-gray-500'
            } border ${darkMode ? 'border-gray-600' : 'border-gray-200'} rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="What's on your mind?"
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
          />

          {location && (
            <div className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center justify-between`}>
              <span>{location}</span>
              <button
                onClick={() => setLocation(null)}
                className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {media && (
            <div className="mt-2 relative">
              {media.type === 'image' ? (
                <img
                  src={media.url}
                  alt="Post preview"
                  className="rounded-lg max-h-64 w-auto"
                />
              ) : (
                <video
                  src={media.url}
                  controls
                  className="rounded-lg max-h-64 w-auto"
                />
              )}
              <button
                onClick={() => setMedia(null)}
                className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 opacity-75 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <div className="flex space-x-2 relative">
              <label className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full cursor-pointer transition-colors`}>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  disabled={isLoading || isUploading}
                />
                {isUploading ? (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                ) : (
                  <Image className="h-5 w-5 text-blue-500" />
                )}
              </label>

              <button
                className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full relative transition-colors`}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={isLoading}
              >
                <Smile className="h-5 w-5 text-yellow-500" />
              </button>

              {showEmojiPicker && (
  <div className={`
    absolute top-12 left-0 
    ${darkMode ? 'bg-gray-800' : 'bg-white'} 
    p-4 rounded-lg shadow-xl 
    grid grid-cols-8 gap-1 
    z-50 
    border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
    min-w-[320px]
  `}>
    {EMOJI_LIST.map((emoji) => (
      <button
        key={emoji}
        onClick={() => handleEmojiClick(emoji)}
        className={`
          px-3 py-2
          text-xl
          rounded-md 
          transition-all duration-200
          flex items-center justify-center
          w-10 h-10
          ${darkMode 
            ? 'hover:bg-gray-700 active:bg-gray-600' 
            : 'hover:bg-gray-100 active:bg-gray-200'
          }
          transform hover:scale-110
          focus:outline-none focus:ring-2
          ${darkMode 
            ? 'focus:ring-gray-600' 
            : 'focus:ring-gray-300'
          }
        `}
      >
        {emoji}
      </button>
    ))}
  </div>
)}

              <button
                className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                disabled={isLoading}
              >
                <MapPin className="h-5 w-5 text-red-500" />
              </button>

              {showLocationPicker && (
                <LocationPicker
                  darkMode={darkMode}
                  onSelect={handleLocationSelect}
                  onClose={() => setShowLocationPicker(false)}
                />
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isLoading || isUploading}
              className={`flex items-center space-x-2 px-6 py-2 rounded-full transition-colors ${
                isLoading || isUploading || !content.trim()
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Post</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;