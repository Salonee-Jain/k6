
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

 export function getCurrentMonth() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    return currentMonth;
  }


  export function convertDateFormat(inputDate, inputTime) {
    let [time, meridian] = inputTime.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
  
    const inputDateTime = new Date(inputDate);
  
    if (meridian === "PM" && hours !== 12) {
      hours += 12;
    }
  
    inputDateTime.setHours(hours, minutes);
  
    const year = inputDateTime.getFullYear();
    const month = String(inputDateTime.getMonth() + 1).padStart(2, "0");
    const day = String(inputDateTime.getDate()).padStart(2, "0");
    const formattedHours = String(inputDateTime.getHours()).padStart(2, "0");
    const formattedMinutes = String(inputDateTime.getMinutes()).padStart(2, "0");
  
    const outputDateTime = `${year}-${month}-${day} ${formattedHours}:${formattedMinutes}`;
  
    return outputDateTime;
  
  }
  

  export function extractCityStateAndPincode(value) {
    const cityComponent = value.find(component => component.types.includes("locality"));
    const stateComponent = value.find(component => component.types.includes("administrative_area_level_1"));
    const pincodeComponent = value.find(component => component.types.includes("postal_code"));

    const city = cityComponent ? cityComponent.long_name : "Bengaluru";
    const state = stateComponent ? stateComponent.long_name : "Karnataka";
    const pincode = pincodeComponent ? pincodeComponent.long_name : "560038";

    return { city, state, pincode };
}

export function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Adding 1 to month as it's zero-based
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}