import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editUserAction, deleteUserAccountAction } from "../../actions/userAction";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { FaPlus, FaBiking as FaBike, FaCar, FaTruck } from "react-icons/fa";
import { toast } from "react-toastify";

const DelivererProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showNewAreaForm, setShowNewAreaForm] = useState(false);
  const [newAreaData, setNewAreaData] = useState({ city: "", pincode: "" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "male",
    vehicleType: "Bike",
    licenseNumber: "",
    serviceAreas: [],
    workingHours: {
      startTime: "",
      endTime: "",
      workingDays: []
    }
  });

  // NEW: timeParts holds editable parts for start/end time so inputs are controlled properly
  const [timeParts, setTimeParts] = useState({
    startTime: { hour: "", minute: "", period: "" },
    endTime: { hour: "", minute: "", period: "" }
  });

  const vehicleOptions = ['Bike', 'Scooter', 'Car', 'Van', 'Other'];
  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (user) {
      const wh = user.workingHours || { startTime: "", endTime: "", workingDays: [] };
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "male",
        vehicleType: user.vehicleType || "Bike",
        licenseNumber: user.licenseNumber || "",
        serviceAreas: user.serviceAreas && user.serviceAreas.length > 0 ? user.serviceAreas : [],
        workingHours: {
          startTime: wh.startTime || "",
          endTime: wh.endTime || "",
          workingDays: wh.workingDays || []
        }
      });

      // initialize editable parts from incoming formatted strings
      setTimeParts({
        startTime: parseTime(wh.startTime || ""),
        endTime: parseTime(wh.endTime || "")
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name && name.startsWith("workingHours.")) {
      const key = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        workingHours: { ...prev.workingHours, [key]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleServiceAreaChange = (index, field, value) => {
    const updatedAreas = [...formData.serviceAreas];
    updatedAreas[index][field] = value;
    setFormData(prev => ({ ...prev, serviceAreas: updatedAreas }));
  };

  const addServiceArea = () => {
    setShowNewAreaForm(true);
  };

  const handleNewAreaChange = (field, value) => {
    setNewAreaData(prev => ({ ...prev, [field]: value }));
  };

  const confirmAddArea = () => {
    if (newAreaData.city.trim() && newAreaData.pincode.trim()) {
      setFormData(prev => ({
        ...prev,
        serviceAreas: [...prev.serviceAreas, { city: newAreaData.city.trim(), pincode: newAreaData.pincode.trim() }]
      }));
      setNewAreaData({ city: "", pincode: "" });
      setShowNewAreaForm(false);
    }
  };

  const cancelAddArea = () => {
    setNewAreaData({ city: "", pincode: "" });
    setShowNewAreaForm(false);
  };

  const removeServiceArea = (index) => {
    const updatedAreas = formData.serviceAreas.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, serviceAreas: updatedAreas }));
  };

  const generateTimeOptions = () => {
    const hours = [];
    const minutes = [];
    for (let i = 1; i <= 12; i++) hours.push(i.toString());
    for (let i = 0; i < 60; i++) minutes.push(i.toString().padStart(2, '0'));
    return { hours, minutes, periods: ['AM', 'PM'] };
  };

  const timeOptions = generateTimeOptions();

  const parseTime = (timeString) => {
    if (!timeString) return { hour: '', minute: '', period: '' };
    const match = timeString.match(/^(\d{1,2}):(\d{2})\s+(AM|PM)$/);
    if (match) {
      return { hour: match[1], minute: match[2], period: match[3] };
    }
    return { hour: '', minute: '', period: '' };
  };

  // allow formatting with zeroPad minute; returns '' if required parts missing
  const formatTimeString = (hour, minute, period) => {
    if (!hour || minute === "" || !period) return '';
    const h = String(hour);
    const m = String(minute).padStart(2, '0');
    return `${h}:${m} ${period}`;
  };

  // NEW: update editable parts and update formData.workingHours when parts form a complete time
  const handleTimePartChange = (field, component, value) => {
    // normalize values: keep strings
    setTimeParts(prev => {
      const updatedField = { ...prev[field], [component]: value };
      const updated = { ...prev, [field]: updatedField };

      // if all three parts present then update the formatted string in formData
      const formatted = formatTimeString(updatedField.hour, updatedField.minute, updatedField.period);
      setFormData(prevForm => ({
        ...prevForm,
        workingHours: { ...prevForm.workingHours, [field]: formatted }
      }));

      return updated;
    });
  };

  const handleWorkingDayChange = (day) => {
    const currentDays = formData.workingHours.workingDays || [];
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    setFormData(prev => ({
      ...prev,
      workingHours: { ...prev.workingHours, workingDays: updatedDays }
    }));
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      // Leaving edit mode -> ensure final time strings are included in payload
      const finalStart = formatTimeString(
        timeParts.startTime.hour,
        timeParts.startTime.minute,
        timeParts.startTime.period
      ) || formData.workingHours.startTime || "";

      const finalEnd = formatTimeString(
        timeParts.endTime.hour,
        timeParts.endTime.minute,
        timeParts.endTime.period
      ) || formData.workingHours.endTime || "";

      const payload = {
        ...formData,
        workingHours: {
          ...formData.workingHours,
          startTime: finalStart,
          endTime: finalEnd
        }
      };
      console.log("formData",formData);
      const {success,message} = await dispatch(editUserAction(payload)); 
      if(success){
        toast.success("User profile Updated!..")
        setFormData(payload); // keep local state consistent
        setTimeParts({
            startTime: parseTime(payload.workingHours.startTime),
            endTime: parseTime(payload.workingHours.endTime)
        });
        navigate("/profile");
      }else toast.error(message);
    } else {
      setTimeParts({
        startTime: parseTime(formData.workingHours.startTime || ""),
        endTime: parseTime(formData.workingHours.endTime || "")
      });
    }
    setIsEditing(!isEditing);
  };

  const handleDeleteAccount = () => setShowPopup(true);
  const cancelDelete = () => setShowPopup(false);
  const confirmDelete = async () => {
    await dispatch(deleteUserAccountAction());
    navigate("/");
  };

  const getVehicleIcon = (vehicle) => {
    switch (vehicle) {
      case 'Bike':
      case 'Scooter':
        return <FaBike className="text-blue-500" />;
      case 'Car':
        return <FaCar className="text-green-500" />;
      case 'Van':
        return <FaTruck className="text-orange-500" />;
      default:
        return <FaCar className="text-gray-500" />;
    }
  };

  const inputStyle = (enabled = true) =>
    `border-2 px-4 py-3 rounded-lg w-full text-sm font-medium transition-all duration-200 ${
      enabled 
        ? "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white" 
        : "bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
    }`;

  const selectStyle = (enabled = true) =>
    `border-2 px-4 py-3 rounded-lg w-full text-sm font-medium transition-all duration-200 ${
      enabled 
        ? "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white" 
        : "bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
    }`;

  const labelStyle = "block text-sm font-semibold text-gray-700 mb-2";
  const sectionStyle = "bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Deliverer Profile</h2>
              <p className="text-gray-600">Manage your delivery information and settings</p>
            </div>
            <button 
              onClick={handleToggleEdit} 
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                isEditing 
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl" 
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {isEditing ? "Save" : "Edit"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className={sectionStyle}>
            <h3 className="text-lg font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>Name</label>
                <input name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
              <div>
                <label className={labelStyle}>Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
              <div>
                <label className={labelStyle}>Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
              <div>
                <label className={labelStyle}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing} className={selectStyle(isEditing)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vehicle & License Information */}
          <div className={sectionStyle}>
            <h3 className="text-lg font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
              Vehicle & License Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>Vehicle Type</label>
                <div className="relative">
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} disabled={!isEditing} className={selectStyle(isEditing)}>
                    {vehicleOptions.map(vehicle => (
                      <option key={vehicle} value={vehicle}>{vehicle}</option>
                    ))}
                  </select>
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    {getVehicleIcon(formData.vehicleType)}
                  </div>
                </div>
              </div>
              <div>
                <label className={labelStyle}>License Number</label>
                <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} disabled={!isEditing} className={inputStyle(isEditing)} />
              </div>
            </div>
          </div>

          {/* Service Areas */}
          <div className={sectionStyle}>
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Service Areas</h3>
              {isEditing && !showNewAreaForm && (
                <button 
                  onClick={addServiceArea}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  <FaPlus className="text-xs" />
                  Add Area
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {formData.serviceAreas && formData.serviceAreas.length > 0 && (
                formData.serviceAreas.map((area, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className={labelStyle}>City</label>
                      <input 
                        value={area.city || ""}
                        onChange={(e) => handleServiceAreaChange(index, 'city', e.target.value)}
                        disabled={!isEditing}
                        className={inputStyle(isEditing)}
                        placeholder="Enter city name"
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>Pincode</label>
                      <input 
                        value={area.pincode || ""}
                        onChange={(e) => handleServiceAreaChange(index, 'pincode', e.target.value)}
                        disabled={!isEditing}
                        className={inputStyle(isEditing)}
                        placeholder="Enter pincode"
                      />
                    </div>
                    {isEditing && (
                      <div className="flex items-end">
                        <button
                          onClick={() => removeServiceArea(index)}
                          className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* New Area Form */}
              {isEditing && showNewAreaForm && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div>
                    <label className={labelStyle}>City</label>
                    <input 
                      value={newAreaData.city}
                      onChange={(e) => handleNewAreaChange('city', e.target.value)}
                      className={inputStyle(true)}
                      placeholder="Enter city name"
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Pincode</label>
                    <input 
                      value={newAreaData.pincode}
                      onChange={(e) => handleNewAreaChange('pincode', e.target.value)}
                      className={inputStyle(true)}
                      placeholder="Enter pincode"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={confirmAddArea}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <FaPlus className="text-xs" />
                      Add
                    </button>
                    <button
                      onClick={cancelAddArea}
                      className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {(!formData.serviceAreas || formData.serviceAreas.length === 0) && !showNewAreaForm && (
                <div className="text-center py-8 text-gray-500">
                  <p>No service areas added yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Working Hours */}
          <div className={sectionStyle}>
            <h3 className="text-lg font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
              Working Hours
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Start Time */}
            <div>
              <label className={labelStyle}>Start Time</label>
              {isEditing ? (
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" min="0" max="12"
                    value={timeParts.startTime.hour}
                    onChange={(e) => handleTimePartChange('startTime', 'hour', e.target.value)}
                    className={selectStyle(true)} placeholder="Hr" />
                  <input type="number" min="0" max="59"
                    value={timeParts.startTime.minute}
                    onChange={(e) => handleTimePartChange('startTime', 'minute', e.target.value)}
                    className={selectStyle(true)} placeholder="Min" />
                  <select
                    value={timeParts.startTime.period}
                    onChange={(e) => handleTimePartChange('startTime', 'period', e.target.value)}
                    className={selectStyle(true)}>
                    <option value="">AM/PM</option>
                    {timeOptions.periods.map(period => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="border-2 px-4 py-3 rounded-lg bg-gray-50 border-gray-200 text-gray-600">
                  {formData.workingHours.startTime || "Not set"}
                </div>
              )}
            </div>

            {/* End Time */}
            <div>
              <label className={labelStyle}>End Time</label>
              {isEditing ? (
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" min="0" max="12"
                    value={timeParts.endTime.hour}
                    onChange={(e) => handleTimePartChange('endTime', 'hour', e.target.value)}
                    className={selectStyle(true)} placeholder="Hr" />
                  <input type="number" min="0" max="59"
                    value={timeParts.endTime.minute}
                    onChange={(e) => handleTimePartChange('endTime', 'minute', e.target.value)}
                    className={selectStyle(true)} placeholder="Min" />
                  <select
                    value={timeParts.endTime.period}
                    onChange={(e) => handleTimePartChange('endTime', 'period', e.target.value)}
                    className={selectStyle(true)}>
                    <option value="">AM/PM</option>
                    {timeOptions.periods.map(period => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="border-2 px-4 py-3 rounded-lg bg-gray-50 border-gray-200 text-gray-600">
                  {formData.workingHours.endTime || "Not set"}
                </div>
              )}
            </div>
          </div>
            <div>
              <label className={labelStyle}>Working Days</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {dayOptions.map(day => (
                  <label key={day} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formData.workingHours.workingDays || []).includes(day)}
                      onChange={() => handleWorkingDayChange(day)}
                      disabled={!isEditing}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <div className="bg-red-50 rounded-xl border-2 border-red-100 p-6 md:p-8">
            <h3 className="text-lg font-bold text-red-800 mb-4">Danger Zone</h3>
            <p className="text-red-600 mb-6">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Delete Dialog */}
        <Dialog 
          open={showPopup} 
          onClose={cancelDelete}
          PaperProps={{
            style: {
              borderRadius: '16px',
              padding: '8px'
            }
          }}
        >
          <DialogTitle className="font-bold text-xl text-gray-900 pb-2">
            Confirm Delete
          </DialogTitle>
          <DialogContent className="pb-4">
            <p className="text-gray-600">
              Are you sure you want to delete this account? This action cannot be undone.
            </p>
          </DialogContent>
          <DialogActions className="px-6 pb-4 gap-3">
            <Button 
              onClick={cancelDelete}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete} 
              variant="contained"
              className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
              style={{ backgroundColor: '#ef4444' }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default DelivererProfile;
