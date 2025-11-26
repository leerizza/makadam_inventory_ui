import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ title, children, onClose, size = 'medium' }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div className={`bg-white rounded-3xl shadow-2xl ${
        size === 'large' ? 'max-w-4xl w-full' : 'max-w-md w-full'
      } max-h-[90vh] overflow-y-auto`}>
      <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-xl transition-all"
        >
          <X size={24} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export default Modal;