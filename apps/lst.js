/* Some variables are global 
var day = 0;
var month = 0;
var year = 0;
var hr = 0;
var lst = 0;
var olong = 0.0;
var tzone = 0.0;
var hemi = "W";
var lsign = 1;
function setSysTime()
{
    var sysTime = new Date();
    hr          = sysTime.getHours() + sysTime.getMinutes()/60.0;
    month       = sysTime.getMonth() + 1;
    day         = sysTime.getDate();
    year        = sysTime.getFullYear();
    tzone       = -1.0*sysTime.getTimezoneOffset()/60.0;
    olong       = Math.abs(tzone*15.0);
    if (tzone < 0.0) hemi = "W";
    else hemi = "E";
    writeValues();
    calcLST();
}
function calcLST()
{
    checkInputs();
    var ut  = modDay(hr - tzone);
    var dno = getDayno2K(year, month, day, hr);
    var ws  = mod2pi(282.9404 + 4.70935*Math.pow(10.0, -5)*dno);
    var ms  = mod2pi(356.0470 + 0.9856002585*dno);
    var meanlong = mod2pi(ms + ws);
    var gmst0 = (meanlong)/15.0;
    lst       = modDay(gmst0 + ut + lsign*olong/15.0) + 11.0 + 56.0/60.0;
    if (lst >= 24.0) lst = lst - 24.0;
    writeValues();
}
function checkInputs()
{
    readValues();
    var ndays = getDaysinMonth(month, year);
    day  = parseFloat(day);
    year = parseFloat(year);
    day  = Math.round(day);
    year = Math.round(year);
    hr = parseFloat(hr);
    olong = parseFloat(olong);
    tzone = parseFloat(tzone);
    if (year > 53994) year = 53994;
    if (year < -4713) year = -4713;
    if (year == 0) {alert("-ve years for BC, +ve for AD. There is no year 0!"); year = -1}
    if (day > ndays) day = ndays;
    if (day < 1) day = 1;
    if ((hr < 0.0)||(hr >= 24.0)) hr = 0;
    if (Math.abs(tzone) > 12) tzone = 12.0*tzone/Math.abs(tzone);
    if (olong > 180) olong = olong - 180;
    olong = Math.abs(olong);
    if (hemi == "W") lsign = -1;
}
function writeValues()
{
    if (hr.toFixed) hr       = hr.toFixed(2);
    if (lst.toFixed) lst     = lst.toFixed(2);
    if (tzone.toFixed) tzone = tzone.toFixed(2);
    if (olong.toFixed) olong = olong.toFixed(3);
    document.getElementById('day').value   = day;
    document.getElementById('month').value = month;
    document.getElementById('year').value  = year;
    document.getElementById('hr').value    = hr;
    document.getElementById('tzone').value = tzone;
    document.getElementById('olong').value = Math.abs(olong);
    document.getElementById('lst').value   = lst;
    document.getElementById('hemi').value  = hemi;
}
function readValues()
{
    hr    = document.getElementById('hr').value;
    day   = document.getElementById('day').value;
    month = document.getElementById('month').value;
    year  = document.getElementById('year').value;
    tzone = document.getElementById('tzone').value;
    olong = document.getElementById('olong').value;
    hemi  = document.getElementById('hemi').value;
}
function getDayno2K(yy, mm, dd, hr)
{
    var jd = julianDay(yy, mm, dd, hr);
    return parseFloat(jd) - 2451543.5;
}
function modDay(val)
{
    var b = val/24.0;
    var a = 24.0*(b - absFloor(b));
    if (a < 0) a = a + 24.0;
    return a;
}
function absFloor(val)
{
    if (val >= 0.0) return Math.floor(val);
    else return Math.ceil(val);
}
function mod2pi(angle)
{
    var b = angle/360.0;
    var a = 360.0*(b - absFloor(b));
    if (a < 0) a = 360.0 + a;
    return a;
}
function getDaysinMonth(mm, yy)
{
    mm = parseFloat(mm);
    yy = parseFloat(yy);
    var ndays = 31;
    if ((mm == 4)||(mm == 6)||(mm == 9)||(mm == 11)) ndays = 30;
    if  (mm == 2)
    {
        ndays = 28;
        if ((yy %   4) == 0) ndays = 29;
        if ((yy % 100) == 0) ndays = 28;
        if ((yy % 400) == 0) ndays = 29;
    }
    return ndays;
}
function julianDay(yy, mm, dd, hh)
{
    mm = parseFloat(mm);
    yy = parseFloat(yy);
    dd = parseFloat(dd);
    hh = parseFloat(hh);
    var extra = (100.0*yy + mm) - 190002.5;
    var jday  = 367.0*yy;
    jday -= Math.floor(7.0*(yy+Math.floor((mm+9.0)/12.0))/4.0);
    jday += Math.floor(275.0*mm/9.0);
    jday += dd;
    jday += hh/24.0;
    jday += 1721013.5;
    jday -= 0.5*extra/Math.abs(extra);
    jday += 0.5;
    return jday;
}*/

