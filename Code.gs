const CALENDAR_ID = 'fc142fad8373709f04073ac360daa0b2685aef89f98efc130300574a879c183c@group.calendar.google.com';
const TIMEZONE = 'America/Sao_Paulo';

function doGet(e) {
  try {
    const data = getAgendaData();
    const callback = e && e.parameter ? String(e.parameter.callback || '').trim() : '';

    if (callback) {
      if (!/^[A-Za-z_$][0-9A-Za-z_$\.]{0,100}$/.test(callback)) {
        return ContentService.createTextOutput('/* callback inválido */')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService
        .createTextOutput(callback + '(' + JSON.stringify(data) + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    const payload = { error: true, message: String(err && err.message ? err.message : err) };
    const callback = e && e.parameter ? String(e.parameter.callback || '').trim() : '';

    if (callback && /^[A-Za-z_$][0-9A-Za-z_$\.]{0,100}$/.test(callback)) {
      return ContentService
        .createTextOutput(callback + '(' + JSON.stringify(payload) + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getAgendaData() {
  const cal = CalendarApp.getCalendarById(CALENDAR_ID);
  if (!cal) throw new Error('Calendário não encontrado ou sem permissão de leitura.');

  const now = new Date();
  const start = new Date('2026-09-01T00:00:00-03:00');
  const rollingEnd = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
  const campaignEnd = new Date('2026-10-05T23:59:59-03:00');
  const end = rollingEnd > campaignEnd ? rollingEnd : campaignEnd;
  const events = cal.getEvents(start, end);

  const data = events.map(function(event) {
    const title = event.getTitle() || 'Compromisso';
    const location = event.getLocation() || '';
    const point = geocodeEvent_(title, location);

    return {
      id: event.getId(),
      title: title,
      location: location,
      start: isoWithTimezone_(event.getStartTime()),
      end: isoWithTimezone_(event.getEndTime()),
      allDay: event.isAllDayEvent(),
      lat: point ? point.lat : null,
      lng: point ? point.lng : null
    };
  });

  return {
    calendarId: CALENDAR_ID,
    now: isoWithTimezone_(now),
    updatedAt: isoWithTimezone_(new Date()),
    events: data
  };
}

function isoWithTimezone_(date) {
  return Utilities.formatDate(date, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function geocodeEvent_(title, location) {
  const query = String(location || title || '').trim();
  if (!query) return null;

  const generic = /^(elei[cç][oõ]es?|reuni[aã]o|agenda|almo[cç]o|jantar|entrevista|grava[cç][aã]o|live|deslocamento)$/i;
  if (!location && generic.test(query)) return null;

  const cache = CacheService.getScriptCache();
  const key = 'geo:' + Utilities.base64EncodeWebSafe(query).slice(0, 180);
  const cached = cache.get(key);
  if (cached) return JSON.parse(cached);

  try {
    const fullQuery = /minas gerais|\bmg\b/i.test(query) ? query : query + ', Minas Gerais, Brasil';
    const response = Maps.newGeocoder().setRegion('br').geocode(fullQuery);
    if (!response || response.status !== 'OK' || !response.results || !response.results.length) return null;

    const loc = response.results[0].geometry && response.results[0].geometry.location;
    if (!loc) return null;

    if (loc.lat < -23.2 || loc.lat > -14.0 || loc.lng < -51.5 || loc.lng > -39.7) return null;

    const point = { lat: loc.lat, lng: loc.lng };
    cache.put(key, JSON.stringify(point), 21600);
    return point;
  } catch (err) {
    return null;
  }
}
