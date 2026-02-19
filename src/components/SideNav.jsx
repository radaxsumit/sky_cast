import React from "react";
import { motion } from "framer-motion";
import {
    LayoutGrid,
    Map,
    Heart,
    Calendar,
    Settings,
    User,
    Cloud,
} from "lucide-react";

const SidebarLink = ({ icon, active }) => {
    return (
        <motion.button
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-3 rounded-xl transition-all duration-300 group ${
                active
                    ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-800/50"
            }`}
        >
            {active && (
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.7)]"></span>
            )}

            {React.cloneElement(icon, {
                className:
                    "w-6 h-6 transition-transform duration-300 group-hover:scale-110",
            })}
        </motion.button>
    );
};

export const SideNav = ({ isDarkMode }) => {
    return (
        <motion.div
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="fixed left-0 top-0 bottom-0
                 w-20
                 bg-white/80 dark:bg-slate-900/80
                 backdrop-blur-xl
                 border-r border-slate-100 dark:border-slate-800
                 flex flex-col items-center py-8
                 hidden md:flex
                 z-50 transition-all duration-500"
        >
            {/* Logo */}
            <motion.div
                whileHover={{ rotate: 10 }}
                className="mb-12 p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
            >
                <Cloud className="w-6 h-6" />
            </motion.div>

            {/* Main Links */}
            <nav className="flex flex-col flex-1 gap-8">
                <SidebarLink icon={<LayoutGrid />} active />
                <SidebarLink icon={<Map />} />
                <SidebarLink icon={<Heart />} />
                <SidebarLink icon={<Calendar />} />
            </nav>

            {/* Bottom Links */}
            <div className="flex flex-col gap-8">
                <SidebarLink icon={<Settings />} />
                <SidebarLink icon={<User />} />
            </div>
        </motion.div>
    );
};
