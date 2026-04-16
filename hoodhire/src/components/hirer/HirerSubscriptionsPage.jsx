import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    PlusIcon, 
    ShieldCheckIcon, 
    ArrowLeft, 
    Loader2, 
    Check, 
    Zap,
    Crown,
    CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { BorderTrail } from '../ui/border-trail';
import { hirerAPI } from '../../api/hirer';
import { toast } from 'react-hot-toast';

const HirerSubscriptionsPage = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingPlanId, setProcessingPlanId] = useState(null);

    const refreshSubscriptionStatus = async () => {
        // Refresh plans to update any UI states if necessary
        try {
            const data = await hirerAPI.getSubscriptionPlans();
            setPlans(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to refresh plans:', err);
        }
    };

    const handleSubscribe = async (plan) => {
        if (processingPlanId) return;

        try {
            setProcessingPlanId(plan.ID);

            const order = await hirerAPI.createOrder(plan.Name);

            const options = {
                key: order.key_id,
                amount: order.amount,
                currency: order.currency,
                name: "HoodHire Subscription",
                description: `Upgrade to ${plan.Name} Plan`,
                order_id: order.order_id,

                handler: async (response) => {
                    try {
                        setProcessingPlanId(plan.ID);
                        console.log(plan)

                        await hirerAPI.verifyPayment({
                            order_id: response.razorpay_order_id,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                            planID:plan.ID
                        });

                        toast.success(`Subscription activated! Welcome to ${plan.Name}.`, {
                            duration: 5000,
                            icon: '🎉'
                        });

                        await refreshSubscriptionStatus();
                        navigate('/hirer');
                    } catch (err) {
                        console.error("Verification failed", err);
                        toast.error(err.message || "Payment verification failed");
                    } finally {
                        setProcessingPlanId(null);
                    }
                },

                modal: {
                    ondismiss: function () {
                        setProcessingPlanId(null);
                    }
                },

                theme: {
                    color: "#059669",
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on("payment.failed", function (response) {
                console.error("Payment failed", response.error);
                toast.error(response?.error?.description || "Payment failed");
                setProcessingPlanId(null);
            });

            rzp.open();

        } catch (err) {
            console.error("Create order failed", err);
            toast.error(err.message || "Failed to initiate payment");
            setProcessingPlanId(null);
        }
    };

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await hirerAPI.getSubscriptionPlans();
                setPlans(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch subscription plans:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const formatPrice = (pricePaise) => {
        return (pricePaise / 100).toLocaleString('en-IN');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <section className="relative min-h-screen overflow-hidden py-12 bg-white dark:bg-slate-950">
            {/* Background Pattern */}
            <div className={cn(
                'absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]',
                'bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)]',
                'bg-[size:40px_40px]'
            )} />

            <div className="mx-auto w-full max-w-6xl px-4 relative z-10">
                <button 
                    onClick={() => navigate('/hirer')}
                    className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-12 transition-colors font-medium"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="mx-auto max-w-xl space-y-5 text-center mb-16"
                >
                    <div className="flex justify-center">
                        <Badge variant="secondary" className="px-4 py-1 font-mono uppercase tracking-wider">
                            Premium Plans
                        </Badge>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-slate-900 dark:text-white">
                        Pricing Based on Your Success
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        Choose the plan that fits your business needs. Upgrade any time to unlock more features.
                    </p>
                </motion.div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Grid for Plans */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {plans.length === 0 ? (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-slate-500">No active subscription plans available at the moment.</p>
                            </div>
                        ) : (
                            plans.map((plan, index) => (
                                <motion.div
                                    key={plan.ID}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 + (index * 0.1), ease: [0.16, 1, 0.3, 1] }}
                                    className="h-full"
                                >
                                    <div className={cn(
                                        "relative h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl transition-all hover:shadow-2xl hover:border-emerald-500/50 group overflow-hidden",
                                        plan.Name.toLowerCase().includes('yearly') && "border-emerald-500/50 shadow-emerald-500/5"
                                    )}>
                                        {/* Decorative Plus Icons */}
                                        <PlusIcon className="absolute -top-2 -left-2 size-4 text-emerald-500/20 group-hover:text-emerald-500/60 transition-colors" />
                                        <PlusIcon className="absolute -top-2 -right-2 size-4 text-emerald-500/20 group-hover:text-emerald-500/60 transition-colors" />
                                        <PlusIcon className="absolute -bottom-2 -left-2 size-4 text-emerald-500/20 group-hover:text-emerald-500/60 transition-colors" />
                                        <PlusIcon className="absolute -right-2 -bottom-2 size-4 text-emerald-500/20 group-hover:text-emerald-500/60 transition-colors" />

                                        {plan.Name.toLowerCase().includes('yearly') && (
                                            <BorderTrail
                                                className="bg-emerald-500/50"
                                                size={120}
                                                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                            />
                                        )}

                                        <div className="flex-1 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                                        {plan.Name}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        For {plan.DurationDays} days
                                                    </p>
                                                </div>
                                                {plan.Name.toLowerCase().includes('yearly') && (
                                                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white border-0">
                                                        Best Value
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold text-slate-900 dark:text-white">₹</span>
                                                <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                                    {formatPrice(plan.Price)}
                                                </span>
                                            </div>

                                            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                                    What's included:
                                                </p>
                                                <ul className="space-y-3">
                                                    {(plan.Advantages || []).map((adv, idx) => (
                                                        <li key={adv.ID || idx} className="flex items-start gap-3">
                                                            <div className="mt-0.5 rounded-full p-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600">
                                                                <Check size={12} strokeWidth={3} />
                                                            </div>
                                                            <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">
                                                                {adv.Text}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <Button 
                                                onClick={() => handleSubscribe(plan)}
                                                disabled={loading || processingPlanId !== null}
                                                className={cn(
                                                    "w-full group/btn relative overflow-hidden h-12 text-base font-bold transition-all",
                                                    plan.Name.toLowerCase().includes('yearly') 
                                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                                                        : "bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white hover:bg-slate-800"
                                                )}
                                            >
                                                {processingPlanId === plan.ID ? (
                                                    <span className="flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Processing...
                                                    </span>
                                                ) : (
                                                    <>
                                                        Get Started
                                                        <Zap className="ml-2 w-4 h-4 fill-white" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-16 flex flex-col items-center gap-4 py-8 border-t border-slate-100 dark:border-slate-800 text-slate-500"
                    >
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <ShieldCheckIcon className="size-5 text-emerald-600" />
                            <span>Secure Payment Gateway & No Hidden Fees</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HirerSubscriptionsPage;
