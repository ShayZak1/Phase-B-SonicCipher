import { h } from "preact";
import { useState } from "preact/hooks";

const TranslationProfileManager = ({ onApplyProfile }) => {
  const [profiles, setProfiles] = useState(
    JSON.parse(localStorage.getItem("profiles")) || []
  );
  const [profileName, setProfileName] = useState("");
  const [currentSettings, setCurrentSettings] = useState({
    tone: "neutral", // Default tone
    formality: "formal", // Default formality level
    additionalText: "", // Additional specifications
  });

  // Handler to update the current settings
  const handleSettingChange = (field, value) => {
    setCurrentSettings((prevSettings) => ({
      ...prevSettings,
      [field]: value,
    }));
  };

  // Save the current profile with the specified settings
  const saveProfile = () => {
    if (!profileName.trim()) {
      alert("Please provide a profile name");
      return;
    }
    const newProfile = { name: profileName, settings: currentSettings };
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    localStorage.setItem("profiles", JSON.stringify(updatedProfiles));
    setProfileName("");
  };

  // Apply a selected profile's settings
  const applyProfile = (profile) => {
    onApplyProfile(profile.settings); // Send settings to the parent component to be used in the translation request
  };

  // Remove a profile from the list and update local storage
  const deleteProfile = (index) => {
    const updatedProfiles = profiles.filter((_, i) => i !== index);
    setProfiles(updatedProfiles);
    localStorage.setItem("profiles", JSON.stringify(updatedProfiles));
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-white text-lg font-semibold mb-4">Manage Profiles</h3>

      {/* Profile Name Input */}
      <input
        type="text"
        placeholder="Profile Name"
        value={profileName}
        onChange={(e) => setProfileName(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />

      {/* Tone Selector */}
      <select
        value={currentSettings.tone}
        onChange={(e) => handleSettingChange("tone", e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      >
        <option value="neutral">Neutral</option>
        <option value="friendly">Friendly</option>
        <option value="professional">Professional</option>
        {/* Add more tone options as needed */}
      </select>

      {/* Formality Level Selector */}
      <select
        value={currentSettings.formality}
        onChange={(e) => handleSettingChange("formality", e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      >
        <option value="formal">Formal</option>
        <option value="informal">Informal</option>
        {/* Add more formality options as needed */}
      </select>

      {/* Additional Specifications Input */}
      <textarea
        placeholder="Additional specifications for translation"
        value={currentSettings.additionalText}
        onChange={(e) => handleSettingChange("additionalText", e.target.value)}
        className="w-full p-2 mb-2 border rounded h-20"
      ></textarea>

      {/* Save Profile Button */}
      <button
        onClick={saveProfile}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save Profile
      </button>

      {/* Display Saved Profiles */}
      <ul className="mt-4">
        {profiles.map((profile, index) => (
          <li key={index} className="flex justify-between items-center py-2">
            <span className="text-white">{profile.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => applyProfile(profile)}
                className="bg-green-500 text-white px-2 py-1 rounded"
              >
                Apply
              </button>
              <button
                onClick={() => deleteProfile(index)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TranslationProfileManager;
