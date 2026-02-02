const moment = require('moment');

exports.getWorkingDays = (from, to, holidays = []) => {
  const days = [];

  let current = moment(from);
  const end = moment(to);

  while (current <= end) {
    const dateStr = current.format('YYYY-MM-DD');

    if (!holidays.includes(dateStr)) {
      days.push(dateStr);
    }

    current.add(1, 'day');
  }

  return days;
};
