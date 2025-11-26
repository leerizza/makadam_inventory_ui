// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, TrendingUp, ShoppingCart, Users, DollarSign, TrendingDown, BookOpen, Wallet, Truck, BarChart2, RefreshCcw, Database, TrendingUpDown } from 'lucide-react';
import clsx from 'clsx'; // kalau belum punya boleh dihapus dan pakai string biasa
import Makadam_Logo from '../../assets/Makadam_Logo_nobg.png'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { to: '/', label: 'Dashboard', icon: TrendingUp, end: true },
    { to: '/accounts', label: 'Accounts Payment', icon: Wallet },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/sales', label: 'Sales', icon: ShoppingCart },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/purchases', label: 'Purchases', icon: DollarSign },
    { to: '/expenses', label: 'Expenses', icon: TrendingDown },
    { to: '/recipes', label: 'Recipes', icon: BookOpen },
    { to: '/cash-ledger', label: 'Cash Ledger', icon: Wallet },
    { to: '/suppliers', label: 'Suppliers', icon: Truck },
    { to: '/stock-movements', label: 'Stock Movements', icon: RefreshCcw },
    { to: '/reports', label: 'Reports', icon: BarChart2 },
    { to: '/backup', label: 'Backup & Restore', icon: Database },
  ];

  return (
    <aside
      className={clsx(
        'bg-white border-r border-slate-200 flex flex-col transition-all duration-200',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* logo + tombol toggle bisa tetap seperti punyamu */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-white-500 flex items-center justify-center text-white font-bold">
            <img
            src={Makadam_Logo}
            alt="MakadamGear Logo"
            className='w-full h-full object-contain'
            />
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-m font-semibold text-slate-800">MakadamGear</p>
              <p className="text-xs text-slate-500">Inventory Management System</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
              }`
            }
            >
              <Icon size={18} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* footer versi / version info kamu bisa taruh di sini */}
      <div className="p-3 text-xs text-slate-400">
        Version 1.0<br />© 2024 Inventory System
      </div>
    </aside>
  );
};

// contoh icon dummy kalau CreditCardIcon belum ada
const CreditCardIcon = (props) => <DollarSign {...props} />;

export default Sidebar;
