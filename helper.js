
export function convertDatetime(inputDatetime) {
    const [datePart, timePart] = inputDatetime.split(' ');

    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    const ampm = inputDatetime.split(' ').pop();
    let newHour = parseInt(hour, 10);
    if (ampm.toLowerCase() === 'pm' && newHour !== 12) {
        newHour += 12;
    } else if (ampm.toLowerCase() === 'am' && newHour === 12) {
        newHour = 0;
    }

    const formattedDatetime = `${year}-${month}-${day}T${newHour.toString().padStart(2, '0')}:${minute}:00.000`;

    return formattedDatetime;
}

export function addMinutesToTime(inputTime, minutesToAdd) {
    const [time, ampm] = inputTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    const date = new Date()
    date.setHours(hours + (ampm === "PM" && hours !== 12 ? 12 : 0), minutes + minutesToAdd);

    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}



export function generateRandomMobileNumber() {

    const firstDigit = Math.floor(Math.random() * 5) + 5;
    const remainingDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    const mobileNumber = `${firstDigit}${remainingDigits}`;
    return mobileNumber;
  }