import React from 'react';
import { LogOut, Calendar, Menu } from 'lucide-react';

const Header = ({ handleLogout, setSidebarOpen }) => (
  <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-6 py-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="lg:hidden text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-all"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Inventory Management System
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <Calendar size={18} className="text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">
            {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline font-medium">Keluar</span>
        </button>
      </div>
    </div>
  </header>
);

export default Header;