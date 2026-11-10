const TIMEZONE = process.env.BUSINESS_TIMEZONE || 'Asia/Kolkata';

const pad = (n) => String(n).padStart(2, '0');

const isValidDateString = (str) => {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(`${str}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
};

const getDayOfWeek = (dateStr) => new Date(`${dateStr}T00:00:00Z`).getUTCDay();

const getNowInBusinessTimezone = () => {
  const now = new Date();
  const date = now.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
  const hour = parseInt(
    now.toLocaleTimeString('en-GB', { timeZone: TIMEZONE, hour: '2-digit', hour12: false }),
    10
  );
  return { date, hour };
};

const generateSlots = (availability, dateStr, bookedStartTimes = []) => {
  if (!availability.workingDays.includes(getDayOfWeek(dateStr))) {
    return [];
  }

  const { date: today, hour: currentHour } = getNowInBusinessTimezone();
  const slots = [];

  for (let h = availability.startHour; h < availability.endHour; h++) {
    if (dateStr === today && h <= currentHour) continue;

    const startTime = `${pad(h)}:00`;
    if (bookedStartTimes.includes(startTime)) continue;

    slots.push({ startTime, endTime: `${pad(h + 1)}:00` });
  }

  return slots;
};

module.exports = { isValidDateString, generateSlots, getNowInBusinessTimezone };