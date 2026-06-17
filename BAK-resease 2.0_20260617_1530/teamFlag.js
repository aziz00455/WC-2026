function getTeamFlagUrl(team) {

  const map = {
      "Mexico": "https://flagcdn.com/w40/mx.png",
      "South Africa": "https://flagcdn.com/w40/za.png",
      "Korea Republic": "https://flagcdn.com/w40/kr.png",
      "Czechia": "https://flagcdn.com/w40/cz.png",

      "Canada": "https://flagcdn.com/w40/ca.png",
      "Bosnia and Herzegovina": "https://flagcdn.com/w40/ba.png",
      "Qatar": "https://flagcdn.com/w40/qa.png",
      "Switzerland": "https://flagcdn.com/w40/ch.png",

      "Brazil": "https://flagcdn.com/w40/br.png",
      "Morocco": "https://flagcdn.com/w40/ma.png",
      "Haiti": "https://flagcdn.com/w40/ht.png",
      "Scotland": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Flag_of_Scotland.svg/40px-Flag_of_Scotland.svg.png",

      "USA": "https://flagcdn.com/w40/us.png",
      "Paraguay": "https://flagcdn.com/w40/py.png",
      "Australia": "https://flagcdn.com/w40/au.png",
      "Türkiye": "https://flagcdn.com/w40/tr.png",

      "Germany": "https://flagcdn.com/w40/de.png",
      "Curaçao": "https://flagcdn.com/w40/cw.png",
      "Côte d'Ivoire": "https://flagcdn.com/w40/ci.png",
      "Ecuador": "https://flagcdn.com/w40/ec.png",

      "Netherlands": "https://flagcdn.com/w40/nl.png",
      "Japan": "https://flagcdn.com/w40/jp.png",
      "Tunisia": "https://flagcdn.com/w40/tn.png",
      "Sweden": "https://flagcdn.com/w40/se.png",

      "Belgium": "https://flagcdn.com/w40/be.png",
      "Egypt": "https://flagcdn.com/w40/eg.png",
      "IR Iran": "https://flagcdn.com/w40/ir.png",
      "New Zealand": "https://flagcdn.com/w40/nz.png",

      "Spain": "https://flagcdn.com/w40/es.png",
      "Cabo Verde": "https://flagcdn.com/w40/cv.png",
      "Saudi Arabia": "https://flagcdn.com/w40/sa.png",
      "Uruguay": "https://flagcdn.com/w40/uy.png",

      "France": "https://flagcdn.com/w40/fr.png",
      "Senegal": "https://flagcdn.com/w40/sn.png",
      "Iraq": "https://flagcdn.com/w40/iq.png",
      "Norway": "https://flagcdn.com/w40/no.png",

      "Argentina": "https://flagcdn.com/w40/ar.png",
      "Algeria": "https://flagcdn.com/w40/dz.png",
      "Austria": "https://flagcdn.com/w40/at.png",
      "Jordan": "https://flagcdn.com/w40/jo.png",

      "Portugal": "https://flagcdn.com/w40/pt.png",
      "Congo DR": "https://flagcdn.com/w40/cd.png",
      "Uzbekistan": "https://flagcdn.com/w40/uz.png",
      "Colombia": "https://flagcdn.com/w40/co.png",

      "England": "https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Flag_of_England.svg/40px-Flag_of_England.svg.png",
      "Croatia": "https://flagcdn.com/w40/hr.png",
      "Ghana": "https://flagcdn.com/w40/gh.png",
      "Panama": "https://flagcdn.com/w40/pa.png"
  };

  return map[team] || "flags/default.png";
}
