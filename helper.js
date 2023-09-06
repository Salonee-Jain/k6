
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

    const date = new Date();
    //console.log( date.setHours(hours + (ampm === "PM" && hours !== 12 ? 12 : 0), minutes + minutesToAdd))
    date.setHours(hours + (ampm === "PM" && hours !== 12 ? 12 : 0), minutes + minutesToAdd);

    let newHours = date.getHours();
    let newMinutes = date.getMinutes();
    let newAMPM = newHours >= 12 && newHours !== 24 ? "PM" : "AM";
  
    if(newHours==13 && ampm =='PM' ){
        newHours = newHours - 12;
        newAMPM = "AM"
    }
    const formattedHours = (newHours % 12 || 12).toString();

    return `${formattedHours}:${newMinutes.toString().padStart(2, '0')} ${newAMPM}`;
}






 export function generateRandomMobileNumber() {

    const firstDigit = Math.floor(Math.random() * 5) + 5;
    const remainingDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    const mobileNumber = `${firstDigit}${remainingDigits}`;
    return mobileNumber;
  }

 export function addDayToDate(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}


export function getFormattedCurrentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

 export function generateRandomIndex(length){
    return Math.round(Math.random() * length)
 }