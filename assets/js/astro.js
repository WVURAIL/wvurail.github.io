/* Shared astronomy helpers for the WVU RAIL web apps.
   No dependencies. Angles in degrees unless a name says otherwise.
   Longitude is east-positive. */

function frac(x) {
  x = x - Math.floor(x);
  return x < 0 ? x + 1.0 : x;
}

/* Julian Date from a UTC calendar date plus fractional UT hours. */
function julianDay(day, month, year, utHours) {
  if (year < 1900) year += 1900;
  if (month <= 2) { month += 12; year -= 1; }
  var A = Math.floor(year / 100);
  var B = 2 - A + Math.floor(A / 4);          // Gregorian calendar correction
  return Math.floor(365.25 * (year + 4716))
       + Math.floor(30.6001 * (month + 1))
       + day + B - 1524.5 + utHours / 24.0;
}

/* Greenwich Mean Sidereal Time, hours in [0, 24). */
function gmstHours(jd) {
  var MJD  = jd - 2400000.5;
  var MJD0 = Math.floor(MJD);
  var ut   = (MJD - MJD0) * 24.0;
  var t    = (MJD0 - 51544.5) / 36525.0;
  var gmst = 6.697374558 + 1.0027379093 * ut
           + (8640184.812866 + (0.093104 - 0.0000062 * t) * t) * t / 3600.0;
  return 24.0 * frac(gmst / 24.0);
}

/* Local Mean Sidereal Time, hours in [0, 24), for an east-positive longitude (deg). */
function lstHours(jd, longitudeDeg) {
  return 24.0 * frac((gmstHours(jd) + longitudeDeg / 15.0) / 24.0);
}

/* Convenience: LST hours right now (from a Date) at a longitude (deg). */
function lstNow(date, longitudeDeg) {
  var ut = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  var jd = julianDay(date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear(), ut);
  return lstHours(jd, longitudeDeg);
}

/* Horizontal (azimuth/altitude, deg) -> Equatorial (RA hours, Dec deg).
   Azimuth measured from North, increasing toward East. */
function horizontalToEquatorial(azDeg, altDeg, latDeg, lstH) {
  var d2r = Math.PI / 180.0;
  var az = azDeg * d2r, alt = altDeg * d2r, lat = latDeg * d2r;

  var sinDec = Math.sin(alt) * Math.sin(lat) + Math.cos(alt) * Math.cos(lat) * Math.cos(az);
  sinDec = Math.max(-1, Math.min(1, sinDec));
  var dec = Math.asin(sinDec);

  var sinH = -Math.sin(az) * Math.cos(alt) / Math.cos(dec);
  var cosH = (Math.sin(alt) - Math.sin(dec) * Math.sin(lat)) / (Math.cos(dec) * Math.cos(lat));
  var H = Math.atan2(sinH, cosH) / d2r;        // hour angle, degrees

  var raHours = 24.0 * frac((lstH - H / 15.0) / 24.0);
  return { raHours: raHours, decDeg: dec / d2r };
}

/* Formatting helpers */
function pad2(n) { n = Math.floor(n); return (n < 10 ? "0" : "") + n; }

function hmsFromHours(h) {
  var hh = Math.floor(h);
  var mm = Math.floor(60 * (h - hh));
  var ss = Math.round(60 * (60 * (h - hh) - mm));
  if (ss === 60) { ss = 0; mm += 1; }
  if (mm === 60) { mm = 0; hh = (hh + 1) % 24; }
  return pad2(hh) + ":" + pad2(mm) + ":" + pad2(ss);
}

function dmsFromDeg(d) {
  var sign = d < 0 ? "-" : "+";
  d = Math.abs(d);
  var deg = Math.floor(d);
  var min = Math.floor(60 * (d - deg));
  var sec = Math.round(60 * (60 * (d - deg) - min));
  if (sec === 60) { sec = 0; min += 1; }
  if (min === 60) { min = 0; deg += 1; }
  return sign + pad2(deg) + "\u00B0" + pad2(min) + "'" + pad2(sec) + '"';
}

/* Allow Node to import these for testing (ignored by browsers). */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { frac, julianDay, gmstHours, lstHours, lstNow,
                     horizontalToEquatorial, pad2, hmsFromHours, dmsFromDeg };
}
