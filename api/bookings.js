const CAL_API_URL = "https://api.cal.com/v2/bookings";
const CAL_API_VERSION = "2026-02-25";
const DEFAULT_TIME_ZONE = "Europe/Andorra";

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;

  try {
    return JSON.parse(req.body);
  } catch {
    return null;
  }
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidIsoDate(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const body = getBody(req);
  if (!body) return sendJson(res, 400, { error: "Request body must be valid JSON" });

  const {
    start,
    name,
    email,
    phoneNumber: phoneNumberValue,
    phone_number,
    timeZone: timeZoneValue,
    time_zone,
    language = "es",
    eventTypeId: eventTypeIdValue,
    event_type_id,
    eventTypeSlug: eventTypeSlugValue,
    event_type_slug,
    username = "peluqueriaa",
    lengthInMinutes: lengthInMinutesValue,
    length_in_minutes,
    notes,
  } = body;

  const phoneNumber = phoneNumberValue ?? phone_number;
  const timeZone = timeZoneValue ?? time_zone ?? DEFAULT_TIME_ZONE;
  const eventTypeId = eventTypeIdValue ?? event_type_id;
  // Never guess the service. A missing slug must fail instead of silently
  // creating a booking for an unrelated event type.
  const eventTypeSlug = eventTypeSlugValue ?? event_type_slug;
  const lengthInMinutes = lengthInMinutesValue ?? length_in_minutes;

  const missing = [];
  if (!isValidIsoDate(start)) missing.push("start");
  if (typeof name !== "string" || !name.trim()) missing.push("name");
  if (!isValidEmail(email)) missing.push("email");
  if (!eventTypeId && !eventTypeSlug) missing.push("eventTypeSlug or eventTypeId");

  if (missing.length) {
    return sendJson(res, 400, {
      error: "Missing or invalid booking fields",
      fields: missing,
    });
  }

  const payload = {
    start,
    attendee: {
      name: name.trim(),
      email: email.trim(),
      timeZone,
      language,
      ...(phoneNumber ? { phoneNumber: String(phoneNumber).trim() } : {}),
    },
    ...(eventTypeId ? { eventTypeId: Number(eventTypeId) } : { eventTypeSlug, username }),
    ...(lengthInMinutes ? { lengthInMinutes: Number(lengthInMinutes) } : {}),
    ...(notes ? { metadata: { notes: String(notes) } } : {}),
  };

  try {
    const headers = {
      "Content-Type": "application/json",
      "cal-api-version": CAL_API_VERSION,
    };

    // Cal.com permite crear reservas públicas con este endpoint. Si se configura
    // CAL_API_KEY, la enviamos como autenticación adicional sin hacerla obligatoria.
    if (process.env.CAL_API_KEY) {
      headers.Authorization = `Bearer ${process.env.CAL_API_KEY}`;
    }

    const response = await fetch(CAL_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const responseBody = await response.json().catch(() => ({}));
    return sendJson(res, response.status, responseBody);
  } catch (error) {
    console.error("Cal.com booking request failed", error);
    return sendJson(res, 502, { error: "Unable to reach Cal.com" });
  }
}
