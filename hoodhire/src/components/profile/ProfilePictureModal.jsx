import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { seekerAPI } from '../../api/seeker';
import { hirerAPI } from '../../api/hirer';
import toast from 'react-hot-toast';

const ProfilePictureModal = ({ isOpen, onClose, onUploadSuccess, role, currentImage }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error("Please select an image file");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            if (role === 'seeker') {
                await seekerAPI.uploadProfilePicture(formData);
            } else {
                await hirerAPI.uploadProfilePicture(formData);
            }
            toast.success("Profile picture updated successfully!");
            onUploadSuccess();
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to upload profile picture");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to remove your profile picture?")) return;

        setIsUploading(true);
        try {
            if (role === 'seeker') {
                await seekerAPI.deleteProfilePicture();
            } else {
                await hirerAPI.deleteProfilePicture();
            }
            toast.success("Profile picture removed");
            onUploadSuccess();
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to remove profile picture");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsUploading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#16181d] w-full max-w-md rounded-xl shadow-2xl border border-slate-200 dark:border-[#262933] overflow-hidden transform transition-all scale-100 opacity-100 flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-[#262933] flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Camera size={20} className="text-[#009966]" />
                        Update Profile Picture
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#262933] text-slate-400 dark:text-slate-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 flex flex-col items-center gap-6">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-full bg-slate-50 dark:bg-[#1a1d24] border-4 border-slate-100 dark:border-[#262933] flex items-center justify-center overflow-hidden shadow-inner font-bold">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : currentImage ? (
                                <img src={currentImage} alt="Current Profile" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon size={64} className="text-slate-300 dark:text-slate-700" />
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-1 right-1 p-2.5 bg-[#009966] text-white rounded-full shadow-lg hover:bg-[#008855] transition-all transform hover:scale-110"
                            title="Upload new picture"
                        >
                            <Upload size={18} />
                        </button>
                        {previewUrl && (
                            <button
                                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                className="absolute top-1 right-1 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all transform hover:scale-110"
                                title="Clear selection"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />

                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {selectedFile ? selectedFile.name : "Select an image to upload"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Max size: 5MB (JPG, PNG)</p>
                    </div>

                    {!selectedFile && (
                        <button
                            onClick={handleDelete}
                            disabled={isUploading}
                            className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-bold transition-colors"
                        >
                            <Trash2 size={16} /> Remove Current Picture
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-[#1a1d24]/50 border-t border-slate-100 dark:border-[#262933] flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 py-2.5 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-[#262933] rounded-md transition-colors"
                        disabled={isUploading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                        className="flex-1 py-2.5 bg-[#009966] text-white font-bold text-sm rounded-md shadow-sm hover:shadow-md hover:bg-[#008855] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePictureModal;
