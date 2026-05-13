import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

const CountdownTimer = ({ checkIn, checkInTime, checkOut, checkOutTime }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setTimeLeft('');
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      
      // Create check-in datetime
      const checkInDate = new Date(checkIn);
      if (checkInTime) {
        const [inHour, inMinute] = checkInTime.split(':');
        checkInDate.setHours(parseInt(inHour), parseInt(inMinute), 0, 0);
      } else {
        checkInDate.setHours(0, 0, 0, 0);
      }
      
      // Create checkout datetime
      const checkOutDate = new Date(checkOut);
      if (checkOutTime) {
        // If checkout time is specified, use it
        const [outHour, outMinute] = checkOutTime.split(':');
        checkOutDate.setHours(parseInt(outHour), parseInt(outMinute), 0, 0);
      } else {
        // For daily bookings without time, default checkout is 12:00 noon
        checkOutDate.setHours(12, 0, 0, 0);
      }
      
      // Check if booking is currently active
      if (now < checkInDate) {
        // Booking hasn't started yet
        setIsActive(false);
        setTimeLeft('');
        return;
      }
      
      if (now > checkOutDate) {
        // Booking has ended
        setIsExpired(true);
        setIsActive(false);
        setTimeLeft('Waktu Habis');
        return;
      }
      
      // Booking is active, show countdown
      setIsActive(true);
      
      // Calculate difference in milliseconds
      const diff = checkOutDate - now;
      
      // Convert to days, hours, minutes, and seconds
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) {
        setTimeLeft(`Sisa ${days} hari ${hours} jam`);
      } else if (hours > 0) {
        setTimeLeft(`Sisa ${hours} jam ${minutes} menit`);
      } else if (minutes > 0) {
        setTimeLeft(`Sisa ${minutes} menit ${seconds} detik`);
      } else {
        setTimeLeft(`Sisa ${seconds} detik`);
      }
      
      setIsExpired(false);
    };

    // Calculate immediately
    calculateTimeLeft();
    
    // Update every second for realtime countdown
    const interval = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [checkIn, checkInTime, checkOut, checkOutTime]);

  if (!timeLeft) return null;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
      isExpired 
        ? 'bg-red-100 text-red-700' 
        : 'bg-orange-100 text-orange-700 animate-pulse'
    }`}>
      <FontAwesomeIcon icon={faClock} />
      <span>{timeLeft}</span>
    </div>
  );
};

export default CountdownTimer;
