import http from 'k6/http';

function getAdminManagementCustomer(customerId) {
  const url = `${baseUrl}/appointment/v1/admin-management/${customerId}`;
  const response = http.get(url);
  return response;
}

function getAllAppointments(offset = 0, limit = 10, status = '', fromDt = '', toDt = '') {
  const queryParams = {
    offset,
    limit,
    status,
    sortBy: 'date',
    reverse: true,
    fromDt,
    toDt,
  };

  const url = `${baseUrl}/appointment/v1/admin-management/all-appointments?` +
    Object.entries(queryParams)
      .filter(([_, value]) => value !== '') // Exclude empty parameters
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

  const response = http.get(url);
  return response;
}

function getExpertAppointments(expertId) {
  const url = `${baseUrl}/appointment/v1/admin-management/expert-appointments/${expertId}`;
  const response = http.get(url);
  return response;
}

function rescheduleAppointment(appointmentId) {
  const url = `${baseUrl}/appointment/v1/admin-management/reschedule/${appointmentId}`;
  const response = http.post(url);
  return response;
}

function cancelAppointment(appointmentId) {
  const url = `${baseUrl}/appointment/v1/admin-management/cancel/${appointmentId}`;
  const response = http.post(url);
  return response;
}

function getExpertSlots(expertId) {
  const url = `${baseUrl}/appointment/v1/admin-management/slots/${expertId}`;
  const response = http.get(url);
  return response;
}

function scheduleAppointment(data) {
  const url = `${baseUrl}/appointment/v1/admin-management/schedule`;
  const headers = { 'Content-Type': 'application/json' };
  const response = http.post(url, JSON.stringify(data), { headers });
  return response;
}

function sendAppointmentReminder(appointmentId) {
  const url = `${baseUrl}/appointment/v1/admin-management/reminder/${appointmentId}`;
  const response = http.post(url);
  return response;
}

function generateLead(data) {
  const url = `${baseUrl}/appointment/v1/admin-management/lead-gen`;
  const headers = { 'Content-Type': 'application/json' };
  const response = http.post(url, JSON.stringify(data), { headers });
  return response;
}

export default function () {
  // Example usage of the functions:
  
  const customerResponse = getAdminManagementCustomer('customerId123');
  check(customerResponse, {
    'Admin Management Customer status is 200': (r) => r.status === 200,
  });

  const allAppointmentsResponse = getAllAppointments();
  check(allAppointmentsResponse, {
    'All Appointments status is 200': (r) => r.status === 200,
  });

  const expertAppointmentsResponse = getExpertAppointments('expertId123');
  check(expertAppointmentsResponse, {
    'Expert Appointments status is 200': (r) => r.status === 200,
  });

 
}
