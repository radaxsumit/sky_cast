import React from 'react'
import {LayoutGrid, Map, Heart, Calendar, Settings, User, Cloud} from 'lucide-react';

const SidebarLink = ({icon, active}) => {
    return (
        <button
            className={`p-3 rounded-xl transition-all duration-300 group ${
                active
                    ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-100 dark:shadow-none"
                    : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-800/50"
            }`}>
            {icon &&
                React.cloneElement(icon, {
                    className: "w-6 h-6 transition-transform group-hover:scale-110",
                })}
        </button>
    )
}

export const SideNav = () => {
    return (
        <div
            className="fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-slate-100 flex flex-col items-center py-8 hidden:md:flex z-50 transition-all duration-500">
            <div className="mb-12 p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                <Cloud/>
            </div>

            <nav className=" flex flex-col flex-1 gap-8">
                <SidebarLink icon={<LayoutGrid/>} active/>
                <SidebarLink icon={<Map/>}/>
                <SidebarLink icon={<Heart/>}/>
                <SidebarLink icon={<Calendar/>}/>

            </nav>

            <div className="flex flex-col gap-8 ">
                <SidebarLink icon={<Settings/>}/>
                <SidebarLink icon={<User/>}/>
            </div>
        </div>
    )
}
