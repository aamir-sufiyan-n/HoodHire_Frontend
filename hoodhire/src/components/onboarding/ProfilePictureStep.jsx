import React, { useState } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProfilePictureStep = ({ formData, setFormData }) => {
    const [preview, setPreview] = useState(formData.profile_picture_url || null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("File size should be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                // We'll store the actual file object for the final submission if needed, 
                // but for now, we'll store the base64 for preview and simple persistence
                setFormData(prev => ({ ...prev, ProfilePicture: file, profile_picture_url: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removePicture = () => {
        setPreview(null);
        setFormData(prev => ({ ...prev, ProfilePicture: null, profile_picture_url: '' }));
    };

    return (
        <div className="flex flex-col items-center gap-6 py-8">
            <div className="relative group">
                <div className="w-40 h-40 rounded-full border-4 border-emerald-500/20 bg-slate-100 dark:bg-[#1a1d24] flex items-center justify-center overflow-hidden shadow-xl transition-all group-hover:border-emerald-500/40">
                    {preview ? (
                        <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                        <Camera size={48} className="text-slate-300 dark:text-slate-600" />
                    )}
                </div>
                
                {preview && (
                    <button 
                        onClick={removePicture}
                        className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        title="Remove Picture"
                    >
                        <X size={16} />
                    </button>
                )}

                <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-emerald-700 transition-colors border-2 border-white dark:border-[#0f1115]">
                    <Upload size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            </div>

            <div className="text-center max-w-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Add a profile photo</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    A professional photo helps you stand out to local businesses. You can skip this and add it later.
                </p>
            </div>
        </div>
    );
};

export default ProfilePictureStep;
