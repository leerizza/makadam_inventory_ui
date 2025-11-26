import React from "react";

const StatCard = ({ title, value, icon: Icon, gradient, trend }) => {
  const isPositive = trend && trend.startsWith('+');

  return (
    <div className="p-4 bg-white rounded-xl shadow-md flex items-center justify-between">
      <div>
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>

        {trend && (
          <span
            className={`text-sm font-semibold ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} text-white`}>
        <Icon size={28} />
      </div>
    </div>
  );
};
export default StatCard;