import { Home, Building2, Calendar, PlusCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/units', icon: Building2, label: 'Units' },
    { path: '/calendar', icon: Calendar, label: 'Kalender' },
    { path: '/booking', icon: PlusCircle, label: 'Booking' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive 
                    ? 'text-primary-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon 
                  size={24} 
                  className={isActive ? 'stroke-[2.5]' : 'stroke-2'}
                />
                <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
