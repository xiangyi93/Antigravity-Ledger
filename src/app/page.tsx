"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";

export default function Home() {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<{ Item: string; Amount: number; Category: string } | null>(null);

  // Anti-Gravity State
  const [gravityState, setGravityState] = useState<"grounded" | "floating" | "departed">("grounded");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setGravityState("grounded"); // Ensure it's grounded before potential lift off logic, or just stay as is

    try {
      const response = await fetch("/api/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await response.json();

      if (data.success) {
        setLastTransaction(data.data);
        // Trigger Anti-Gravity
        setGravityState("departed");

        // Reset after animation
        setTimeout(() => {
          setInput("");
          setGravityState("grounded");
          setIsSubmitting(false);
        }, 2000); // 2 seconds for animation to complete
      } else {
        console.error("Submission failed", data.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Request failed", error);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="z-10 w-full max-w-md">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            AntiGravity
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Ledger System</p>
        </header>

        <AnimatePresence mode="wait">
          {gravityState !== "departed" && (
            <motion.div
              key="input-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: -200,
                rotate: Math.random() * 10 - 5,
                transition: { duration: 0.8, ease: "easeIn" }
              }}
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
              className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Start transaction (e.g. Lunch $12)"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                    AI Powered
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${isSubmitting
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/25"
                      }`}
                  >
                    {isSubmitting ? "Processing..." : (
                      <span className="flex items-center gap-2">
                        Send <Send className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success / Last Transaction Feedback */}
        <div className="mt-8 h-20 text-center">
          {lastTransaction && gravityState === "departed" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-400 text-sm"
            >
              <p>Processed:</p>
              <p className="text-white font-medium text-lg">
                {lastTransaction.Item} - ${lastTransaction.Amount} ({lastTransaction.Category})
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
