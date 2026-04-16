import React, { useState, useEffect } from 'react';
import { 
    CreditCard, 
    Plus, 
    Loader2, 
    Pencil, 
    Trash2, 
    X, 
    Search,
    Clock,
    IndianRupee,
    CheckCircle2,
    XCircle,
    MoreVertical
} from 'lucide-react';
import { adminAPI } from '../../api/admin/admin';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const ManageSubscriptions = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPlan, setCurrentPlan] = useState({ 
        plan_name: '', 
        price: '', 
        duration: '',
        advantages: []
    });
    const [newAdvantage, setNewAdvantage] = useState('');
    const [showAdvantageDropdown, setShowAdvantageDropdown] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [expandedAdvantages, setExpandedAdvantages] = useState(null);

    const commonAdvantages = [
        "Unlimited Job Posts",
        "Featured Job Listing",
        "Urgent Listing Badge",
        "Priority Support",
        "24/7 Assistance",
        "Access to Candidate Database",
        "Social Media Promotion",
        "Verified Business Badge",
        "Dedicated Account Manager",
        "Custom Branding"
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await adminAPI.getPlans();
            // User said: the response data looks like [ plans ]
            setPlans(Array.isArray(data) ? data : data.plans || []);
        } catch (err) {
            console.error('Failed to fetch subscription plans:', err);
            toast.error('Failed to load subscription plans');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenAddModal = () => {
        setIsEditing(false);
        setCurrentPlan({ plan_name: '', price: '', duration: '', advantages: [] });
        setNewAdvantage('');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (plan) => {
        setIsEditing(true);
        setCurrentPlan({ 
            id: plan.ID, 
            plan_name: plan.Name || plan.plan_name, 
            price: (plan.Price / 100).toString(), 
            duration: (plan.DurationDays || plan.duration).toString(),
            advantages: (plan.Advantages || plan.advantages || []).map(adv => typeof adv === 'object' ? (adv.Text || adv.text) : adv)
        });
        setNewAdvantage('');
        setIsModalOpen(true);
    };

    const handleAction = async (e) => {
        e.preventDefault();
        if (!currentPlan.plan_name || !currentPlan.price || !currentPlan.duration) {
            return toast.error('Required fields: Name, Price, and Duration');
        }

        const planData = {
            plan_name: currentPlan.plan_name,
            price: parseInt(parseFloat(currentPlan.price) * 100),
            duration: parseInt(currentPlan.duration),
            advantages: currentPlan.advantages
        };

        setActionLoading(true);
        try {
            if (isEditing) {
                await adminAPI.updatePlan(currentPlan.id, planData);
                toast.success('Subscription plan updated');
            } else {
                await adminAPI.createPlan(planData);
                toast.success('Subscription plan created');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('Action failed:', err);
            toast.error(err.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This subscription plan will be permanently deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
        });

        if (result.isConfirmed) {
            try {
                await adminAPI.deletePlan(id);
                toast.success('Plan deleted successfully');
                fetchData();
            } catch (err) {
                toast.error('Failed to delete plan');
            }
        }
    };

    const handleToggle = async (id) => {
        try {
            await adminAPI.togglePlan(id);
            toast.success('Plan status toggled');
            // Optimistic update
            setPlans(plans.map(p => p.ID === id ? { ...p, IsActive: !p.IsActive } : p));
        } catch (err) {
            toast.error('Failed to toggle status');
        }
    };

    const filteredPlans = plans.filter(plan => 
        (plan.plan_name || plan.Name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addAdvantage = () => {
        if (!newAdvantage.trim() || currentPlan.advantages.includes(newAdvantage.trim())) return;
        setCurrentPlan({
            ...currentPlan,
            advantages: [...currentPlan.advantages, newAdvantage.trim()]
        });
        setNewAdvantage('');
    };

    const removeAdvantage = (index) => {
        setCurrentPlan({
            ...currentPlan,
            advantages: currentPlan.advantages.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                        <CreditCard className="text-emerald-600" /> Subscription Plans
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
                        Manage and configure subscription tiers for businesses.
                    </p>
                </div>
                <button 
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-md font-bold text-sm transition-all shadow-sm"
                >
                    <Plus size={18} /> Create New Plan
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-[#1a1d24] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600">
                            <CreditCard size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{plans.filter(p => p.IsActive).length}</h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Active Plans</p>
                </div>
                <div className="bg-white dark:bg-[#1a1d24] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500">
                            <XCircle size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">Closed</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{plans.filter(p => !p.IsActive).length}</h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Closed Plans</p>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search plans by name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-white font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4">Plan Name</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="animate-spin text-emerald-600" size={32} />
                                            <span className="text-sm font-bold text-slate-500">Loading plans...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPlans.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-50">
                                            <CreditCard size={48} className="text-slate-300" />
                                            <span className="text-sm font-bold text-slate-500">No subscription plans found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPlans.map((plan) => (
                                    <tr key={plan.ID} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 font-bold shadow-sm border border-emerald-100 dark:border-emerald-800/30">
                                                    {(plan.plan_name || plan.Name)?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 dark:text-white leading-tight">{plan.plan_name || plan.Name}</span>
                                                    {(plan.advantages || plan.Advantages)?.length > 0 && (
                                                        <div className="relative mt-1">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setExpandedAdvantages(expandedAdvantages === plan.ID ? null : plan.ID);
                                                                }}
                                                                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                                            >
                                                                View {(plan.advantages || plan.Advantages).length} advantages
                                                                <MoreVertical size={10} />
                                                            </button>
                                                            
                                                            {expandedAdvantages === plan.ID && (
                                                                <>
                                                                    <div 
                                                                        className="fixed inset-0 z-[60]" 
                                                                        onClick={(e) => { e.stopPropagation(); setExpandedAdvantages(null); }}
                                                                    />
                                                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#1e222b] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-[70] p-2 animate-in zoom-in-95 duration-150">
                                                                        <div className="flex flex-col gap-1.5 capitalize text-left">
                                                                            {(plan.advantages || plan.Advantages).map((adv, idx) => (
                                                                                <div key={idx} className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                                                                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                                                    {typeof adv === 'object' ? (adv.Text || adv.text) : adv}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                                                ₹{(plan.Price / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                            {plan.DurationDays || plan.duration} Days
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${plan.IsActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {plan.IsActive ? 'Active' : 'Closed'}
                                                </span>
                                                <button
                                                    onClick={() => handleToggle(plan.ID)}
                                                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${plan.IsActive ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${plan.IsActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenEditModal(plan)}
                                                    className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-all"
                                                    title="Edit Plan"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(plan.ID)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                                                    title="Delete Plan"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a1d24] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {isEditing ? <Pencil size={20} className="text-emerald-600" /> : <Plus size={20} className="text-emerald-600" />}
                                {isEditing ? 'Edit Subscription Plan' : 'Create New Plan'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAction} className="p-6 space-y-4 text-left">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Plan Name</label>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Standard Monthly" 
                                        value={currentPlan.plan_name}
                                        onChange={(e) => setCurrentPlan({ ...currentPlan, plan_name: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Price (₹)</label>
                                    <div className="relative group">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            placeholder="299.00" 
                                            value={currentPlan.price}
                                            onChange={(e) => setCurrentPlan({ ...currentPlan, price: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Duration (Days)</label>
                                    <div className="relative group">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input 
                                            type="number" 
                                            placeholder="30" 
                                            value={currentPlan.duration}
                                            onChange={(e) => setCurrentPlan({ ...currentPlan, duration: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                             <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Advantages</label>
                                <div className="flex gap-2 mb-3">
                                    <input 
                                        type="text" 
                                        placeholder="Type an advantage (e.g. Unlimited Posts)..." 
                                        value={newAdvantage}
                                        onChange={(e) => setNewAdvantage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAdvantage())}
                                        className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white font-medium"
                                    />
                                    <button 
                                        type="button"
                                        onClick={addAdvantage}
                                        className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto no-scrollbar py-1">
                                    {currentPlan.advantages?.map((adv, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 pl-2.5 pr-1.5 py-1 rounded-md group/item animate-in zoom-in-90 duration-200">
                                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 truncate max-w-[150px]">{adv}</span>
                                            <button 
                                                type="button"
                                                onClick={() => removeAdvantage(index)}
                                                className="text-emerald-400 hover:text-red-500 transition-all p-0.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <X size={12} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!currentPlan.advantages || currentPlan.advantages.length === 0) && (
                                        <p className="text-[10px] text-slate-400 text-center italic py-2 w-full">No advantages added yet</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-lg font-bold text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2.5 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" size={18} /> : (isEditing ? 'Update Plan' : 'Create Plan')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSubscriptions;
