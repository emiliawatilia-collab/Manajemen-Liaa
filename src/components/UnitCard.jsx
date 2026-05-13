import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faUser, faCalendarAlt, faPhone } from '@fortawesome/free-solid-svg-icons';
import CountdownTimer from './CountdownTimer';

const UnitCard = ({ unit, onCheckout, onDelete, onShowDetail }) => {
  const isOccupied = unit.status === 'terisi';

  return (
    <Link to={`/units/${unit.firebaseId || unit.id}`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        {/* Header */}
        <div className={`px-4 py-3 ${isOccupied ? 'bg-red-50' : 'bg-green-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-lg" style={{ color: isOccupied ? '#dc2626' : '#16a34a' }} />
              <span className="font-bold text-lg text-gray-900">Unit {unit.unitNumber}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isOccupied 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {isOccupied ? 'Terisi' : 'Kosong'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          {isOccupied && unit.tenant ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                <span className="font-medium">{unit.tenant.name || 'Tamu'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                <span>
                  {new Date(unit.tenant.checkIn).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                  {unit.tenant.checkInTime && ` ${unit.tenant.checkInTime}`}
                  {' - '}
                  {new Date(unit.tenant.checkOut).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'short',
                    year: 'numeric'
                  })}
                  {unit.tenant.checkOutTime && ` ${unit.tenant.checkOutTime}`}
                </span>
              </div>

              {/* Countdown Timer for Transit Bookings */}
              <CountdownTimer 
                checkIn={unit.tenant.checkIn}
                checkInTime={unit.tenant.checkInTime}
                checkOut={unit.tenant.checkOut}
                checkOutTime={unit.tenant.checkOutTime}
              />

              {unit.tenant.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                  <span>{unit.tenant.phone}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Harga/hari</span>
                  <span className="text-lg font-bold text-primary-600">
                    Rp {((unit.tenant?.price || unit.price) || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="text-center text-gray-400 mb-4">
                <Building2 size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Unit tersedia</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">Harga/hari</span>
                <span className="text-lg font-bold text-primary-600">
                  Rp {(unit.price || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          {isOccupied ? (
            <div className="space-y-2">
              {onShowDetail && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    onShowDetail(unit);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors"
                >
                  Lihat Detail & KTP
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                {onCheckout && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      onCheckout(unit.firebaseId || unit.id);
                    }}
                    className="py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors"
                  >
                    Check-out
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Checkout dulu sebelum menghapus unit');
                    }}
                    className="py-2.5 bg-gray-300 text-gray-500 rounded-xl font-medium text-sm cursor-not-allowed"
                    disabled
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {onShowDetail && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    onShowDetail(unit);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors"
                >
                  Lihat Detail
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(unit.firebaseId || unit.id);
                  }}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors"
                >
                  Hapus Unit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const Building2 = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
    <path d="M10 6h4"/>
    <path d="M10 10h4"/>
    <path d="M10 14h4"/>
    <path d="M10 18h4"/>
  </svg>
);

export default UnitCard;
