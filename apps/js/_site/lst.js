function calculate() {
    var longit = -1.583;
    var tDate = new Date();
    var utSeconds    = tDate.getUTCSeconds();
    var utMinutes    = tDate.getUTCMinutes();
    var utHours      = tDate.getUTCHours();
    var utDay        = tDate.getUTCDate();
    var utMonth      = tDate.getUTCMonth() + 1;
    var utYear       = tDate.getUTCFullYear();
    var UT        = utHours + utMinutes/60 + utSeconds/3600;
    var LMST      = LM_Sidereal_Time(JulDay (utDay, utMonth, utYear, UT),longit);
    var GMST      = LM_Sidereal_Time(JulDay (utDay, utMonth, utYear, UT),0.0);

    var cuth = utHours.toString();
    if ( utHours < 10 ) var cuth = "0" + utHours.toString(); 
    var cutm = utMinutes.toString()
    if ( utMinutes < 10 ) var cutm = "0" + utMinutes.toString(); 
    cuts = utSeconds.toString();
    if ( utSeconds < 10 ) var  cuts = "0" + utSeconds.toString(); 

    var h = Math.floor(LMST);
    var min = Math.floor(60.0*frac(LMST));
    var secs = Math.round(60.0*(60.0*frac(LMST)-min));
    if (secs == 60) {
     secs = 0;
     min = min + 1;
    }
    ch = h.toString();
    if ( h < 10 ) var ch = "0" + h.toString(); 
    cmin = min.toString()
    if ( min < 10 ) var cmin = "0" + min.toString(); 
    csecs = secs.toString();
    if ( secs < 10 ) var csecs = "0" + secs.toString(); 

    h = Math.floor(GMST);
    min = Math.floor(60.0*frac(GMST));
    secs = Math.round(60.0*(60.0*frac(GMST)-min));
    if (secs == 60) {
     secs = 0;
     min = min + 1;
    }
    
    gmt_ch = h.toString();
    if ( h < 10 ) var gmt_ch = "0" + h.toString(); 
    gmt_cmin = min.toString()
    if ( min < 10 ) var gmt_cmin = "0" + min.toString(); 
    gmt_csecs = secs.toString();
    if ( secs < 10 ) var gmt_csecs = "0" + secs.toString(); 


    var clock_div = document.getElementById('js_clock');
    clock_div.innerHTML = "<font face=Courier color=#000000> Coordinated Universal Time (UTC) &nbsp;" +cuth + ":"  +cutm+":"+cuts+"<br>Greenwich Local Sidereal Time &nbsp;&nbsp;&nbsp;&nbsp;" +gmt_ch + ":"  + gmt_cmin  + ":" +gmt_csecs+"<br>Durham Local Sidereal Time &nbsp; &nbsp; &nbsp; &nbsp;" +ch + ":"  + cmin  + ":" +csecs+ "</font>";
    setTimeout("calculate()",997);
}

function LM_Sidereal_Time (jd, longitude) {
    var GMST = GM_Sidereal_Time(jd);		
    var LMST =  24.0*frac((GMST + longitude/15.0)/24.0);
    return LMST;
   }

function GM_Sidereal_Time (jd) {	
    var t_eph, ut, MJD0, MJD;		
    MJD = jd - 2400000.5;		
    MJD0 = Math.floor(MJD);
    ut = (MJD - MJD0)*24.0;		
    t_eph  = (MJD0-51544.5)/36525.0;			
    return  6.697374558 + 1.0027379093*ut + (8640184.812866 + (0.093104 - 0.0000062*t_eph)*t_eph)*t_eph/3600.0;		
   }

function JulDay (date, month, year, UT) {
    if (year<1900) year=year+1900
    if (month<=2) { month=month+12; year=year-1 }
    A = Math.floor(year/100);
    B = -13;
    JD =  Math.floor(365.25*(year+4716)) + Math.floor(30.6001*(month+1)) + date + B -1524.5 + UT/24.0;
    return JD
   }
   
function frac(X) {
    X = X - Math.floor(X);
    if (X<0) X = X + 1.0;
    return X;		
   }

calculate();

