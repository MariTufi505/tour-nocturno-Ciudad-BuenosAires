"use strict";

/* ============================================================
   1. DEFINICIÓN DE COMUNAS
   ============================================================ */

/**
 * Cada comuna tiene: nombre para mostrar, color de relleno/borde,
 * y los nombres de barrios que la componen (en minúsculas normalizados
 * para hacer matching con el GeoJSON).
 */
const COMUNAS = {
  1:  { nombre: "Comuna 1",  color: "#6c63ff", barrios: ["san nicolas","monserrat","san telmo","constitucion","retiro","puerto madero"] },
  2:  { nombre: "Comuna 2",  color: "#c084fc", barrios: ["recoleta"] },
  3:  { nombre: "Comuna 3",  color: "#d97706", barrios: ["balvanera","san cristobal"] },
  4:  { nombre: "Comuna 4",  color: "#84cc16", barrios: ["la boca","barracas","parque patricios","nueva pompeya"] },
  5:  { nombre: "Comuna 5",  color: "#94a3b8", barrios: ["almagro","boedo"] },
  6:  { nombre: "Comuna 6",  color: "#64748b", barrios: ["caballito"] },
  7:  { nombre: "Comuna 7",  color: "#38bdf8", barrios: ["flores","parque chacabuco"] },
  8:  { nombre: "Comuna 8",  color: "#ef4444", barrios: ["villa soldati","villa lugano","villa riachuelo"] },
  9:  { nombre: "Comuna 9",  color: "#14b8a6", barrios: ["liniers","mataderos","parque avellaneda"] },
  10: { nombre: "Comuna 10", color: "#22c55e", barrios: ["monte castro","versalles","floresta","velez sarsfield","villa luro","villa real"] },
  11: { nombre: "Comuna 11", color: "#3b82f6", barrios: ["villa del parque","villa devoto","villa gral. mitre","villa santa rita"] },
  12: { nombre: "Comuna 12", color: "#f59e0b", barrios: ["coghlan","saavedra","villa urquiza","villa pueyrredon"] },
  13: { nombre: "Comuna 13", color: "#a78bfa", barrios: ["belgrano","colegiales","nuñez"] },
  14: { nombre: "Comuna 14", color: "#e2e8f0", barrios: ["palermo"] },
  15: { nombre: "Comuna 15", color: "#a3e635", barrios: ["agronomia","chacarita","paternal","parque chas","villa crespo","villa ortuzar"] },
};

/* Índice rápido: nombre_normalizado → id de comuna */
const BARRIO_COMUNA_MAP = {};
Object.entries(COMUNAS).forEach(([id, c]) => {
  c.barrios.forEach(b => { BARRIO_COMUNA_MAP[b] = +id; });
});

function normalizeBarrioName(name) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/\./g, "")   // quita puntos
    .trim();
}

function getComunaForBarrio(geoJsonNombre) {
  const norm = normalizeBarrioName(geoJsonNombre);
  const id   = BARRIO_COMUNA_MAP[norm];
  return id ? COMUNAS[id] : null;
}

/* ============================================================
   2. GEODATA — barrios de CABA desde GeoCaba.json (simplificado)
   Polígonos en coordenadas reales [lng, lat] — geometría oficial GCBA.
   Simplificados con Douglas-Peucker (tolerancia 0.0003°) para rendimiento SVG.
   ============================================================ */
const GEO_BARRIOS = [{"nombre":"Agronomia","comuna":15,"coords":[[-58.47589,-34.59173],[-58.47883,-34.59968],[-58.48346,-34.59776],[-58.49718,-34.59682],[-58.50354,-34.59446],[-58.50308,-34.59439],[-58.50347,-34.59396],[-58.48879,-34.58482],[-58.48471,-34.58912],[-58.47589,-34.59173]]},{"nombre":"Almagro","comuna":5,"coords":[[-58.416,-34.59786],[-58.41192,-34.59801],[-58.41391,-34.60725],[-58.41466,-34.60819],[-58.41447,-34.61074],[-58.41287,-34.61412],[-58.41255,-34.62065],[-58.4278,-34.62208],[-58.42926,-34.61511],[-58.43003,-34.61545],[-58.43067,-34.60595],[-58.43334,-34.60268],[-58.43224,-34.60214],[-58.42943,-34.59913],[-58.42679,-34.59795],[-58.416,-34.59786]]},{"nombre":"Balvanera","comuna":3,"coords":[[-58.39294,-34.59964],[-58.39181,-34.61128],[-58.3917,-34.61816],[-58.40352,-34.61884],[-58.41255,-34.62065],[-58.41287,-34.61412],[-58.41447,-34.61074],[-58.41466,-34.60819],[-58.41391,-34.60725],[-58.41192,-34.59801],[-58.40451,-34.59804],[-58.40201,-34.59937],[-58.39873,-34.59977],[-58.39294,-34.59964]]},{"nombre":"Barracas","comuna":4,"coords":[[-58.37066,-34.6295],[-58.36765,-34.65014],[-58.36966,-34.65134],[-58.37002,-34.65211],[-58.36979,-34.65358],[-58.37242,-34.65501],[-58.37412,-34.65677],[-58.38518,-34.65785],[-58.38772,-34.66016],[-58.39076,-34.66103],[-58.39247,-34.6622],[-58.39713,-34.662],[-58.39793,-34.66123],[-58.40076,-34.66048],[-58.40505,-34.6498],[-58.40275,-34.64706],[-58.40061,-34.64656],[-58.4005,-34.64592],[-58.3914,-34.64209],[-58.39148,-34.64083],[-58.38989,-34.64021],[-58.39036,-34.63413],[-58.3834,-34.63222],[-58.38134,-34.63085],[-58.38125,-34.63307],[-58.38015,-34.63304],[-58.37863,-34.6305],[-58.37905,-34.62934],[-58.37457,-34.6268],[-58.37097,-34.62665],[-58.37066,-34.6295]]},{"nombre":"Belgrano","comuna":13,"coords":[[-58.45167,-34.53565],[-58.45313,-34.53581],[-58.45478,-34.53731],[-58.45423,-34.53868],[-58.45217,-34.53956],[-58.45119,-34.53815],[-58.44988,-34.53736],[-58.45003,-34.53612],[-58.44907,-34.53556],[-58.4488,-34.53582],[-58.4494,-34.53632],[-58.44857,-34.5374],[-58.44638,-34.53601],[-58.44386,-34.53614],[-58.44229,-34.53703],[-58.44177,-34.53791],[-58.44158,-34.53763],[-58.44078,-34.5403],[-58.44032,-34.54021],[-58.44026,-34.53921],[-58.44021,-34.53984],[-58.43924,-34.54014],[-58.43756,-34.5398],[-58.43589,-34.54061],[-58.43494,-34.54191],[-58.4342,-34.54187],[-58.43492,-34.542],[-58.43462,-34.54258],[-58.43188,-34.5442],[-58.43005,-34.54688],[-58.4295,-34.54666],[-58.43004,-34.54804],[-58.42963,-34.54863],[-58.42706,-34.54804],[-58.42474,-34.54937],[-58.42543,-34.5497],[-58.4267,-34.55205],[-58.4294,-34.55096],[-58.43099,-34.55113],[-58.43443,-34.55306],[-58.43466,-34.5536],[-58.43411,-34.55396],[-58.44106,-34.5579],[-58.44139,-34.55882],[-58.44033,-34.56056],[-58.43798,-34.56176],[-58.43496,-34.5618],[-58.43541,-34.56254],[-58.44117,-34.56214],[-58.44254,-34.5637],[-58.44786,-34.56672],[-58.44905,-34.56786],[-58.45229,-34.56611],[-58.45763,-34.569],[-58.45771,-34.56953],[-58.46336,-34.57501],[-58.46737,-34.5725],[-58.46808,-34.57291],[-58.47337,-34.56667],[-58.46649,-34.5622],[-58.46769,-34.56169],[-58.46704,-34.56132],[-58.46919,-34.55893],[-58.45301,-34.55051],[-58.45412,-34.54899],[-58.44928,-34.54266],[-58.45944,-34.53781],[-58.45387,-34.53504],[-58.4516,-34.53169],[-58.45079,-34.53216],[-58.44996,-34.53504],[-58.45057,-34.53562],[-58.45167,-34.53565]]},{"nombre":"La Boca","comuna":4,"coords":[[-58.35147,-34.61936],[-58.34958,-34.61979],[-58.34785,-34.61897],[-58.3446,-34.619],[-58.34468,-34.61963],[-58.3452,-34.61984],[-58.34634,-34.61921],[-58.34716,-34.61999],[-58.34594,-34.62296],[-58.3461,-34.62201],[-58.34549,-34.62153],[-58.34471,-34.62135],[-58.34406,-34.62176],[-58.34435,-34.62053],[-58.34379,-34.61883],[-58.33859,-34.61864],[-58.33752,-34.62001],[-58.33693,-34.62182],[-58.33722,-34.62253],[-58.3419,-34.62283],[-58.34214,-34.62225],[-58.34304,-34.62271],[-58.34238,-34.62338],[-58.34189,-34.62304],[-58.34005,-34.62324],[-58.33824,-34.6247],[-58.33703,-34.62489],[-58.33517,-34.62643],[-58.33516,-34.6271],[-58.3362,-34.62818],[-58.33928,-34.6289],[-58.33975,-34.62783],[-58.34067,-34.62783],[-58.34245,-34.62617],[-58.34428,-34.62638],[-58.34141,-34.6289],[-58.34251,-34.62946],[-58.34458,-34.628],[-58.34538,-34.62867],[-58.34706,-34.62729],[-58.34879,-34.62909],[-58.34797,-34.62994],[-58.34832,-34.63028],[-58.34793,-34.63116],[-58.3461,-34.63166],[-58.34907,-34.63255],[-58.35015,-34.63233],[-58.35114,-34.63136],[-58.35239,-34.62901],[-58.35299,-34.62917],[-58.35397,-34.62809],[-58.3603,-34.62395],[-58.36086,-34.62424],[-58.36177,-34.62364],[-58.36102,-34.6244],[-58.36127,-34.62469],[-58.35489,-34.62901],[-58.35277,-34.63357],[-58.35414,-34.63652],[-58.35803,-34.63921],[-58.36036,-34.63919],[-58.36144,-34.63987],[-58.36091,-34.64073],[-58.35813,-34.64187],[-58.35733,-34.64405],[-58.3576,-34.64498],[-58.35982,-34.64597],[-58.3624,-34.64815],[-58.36434,-34.64823],[-58.36765,-34.65014],[-58.37066,-34.6295],[-58.36795,-34.62715],[-58.36798,-34.6252],[-58.3632,-34.62514],[-58.35602,-34.61761],[-58.35515,-34.61955],[-58.3527,-34.61978],[-58.35147,-34.61936]]},{"nombre":"Boedo","comuna":5,"coords":[[-58.41178,-34.63036],[-58.41152,-34.63286],[-58.41049,-34.63524],[-58.41126,-34.6381],[-58.42349,-34.6402],[-58.4278,-34.62208],[-58.41255,-34.62065],[-58.41205,-34.62298],[-58.41178,-34.63036]]},{"nombre":"Caballito","comuna":6,"coords":[[-58.4278,-34.62208],[-58.42676,-34.627],[-58.45158,-34.63064],[-58.46271,-34.60738],[-58.45848,-34.6045],[-58.44625,-34.60762],[-58.4392,-34.60559],[-58.43334,-34.60268],[-58.43067,-34.60595],[-58.43003,-34.61545],[-58.42926,-34.61511],[-58.4278,-34.62208]]},{"nombre":"Chacarita","comuna":15,"coords":[[-58.46023,-34.5783],[-58.4554,-34.57908],[-58.4444,-34.5832],[-58.44479,-34.58452],[-58.43854,-34.58867],[-58.4506,-34.5944],[-58.45549,-34.59784],[-58.45928,-34.59668],[-58.46562,-34.59671],[-58.46438,-34.59256],[-58.46683,-34.5906],[-58.46187,-34.58605],[-58.46038,-34.58553],[-58.46053,-34.5783],[-58.46023,-34.5783]]},{"nombre":"Coghlan","comuna":12,"coords":[[-58.46919,-34.55893],[-58.46704,-34.56132],[-58.46769,-34.56169],[-58.46649,-34.5622],[-58.47299,-34.56644],[-58.4746,-34.56682],[-58.47512,-34.56622],[-58.47619,-34.56686],[-58.47906,-34.56394],[-58.48116,-34.56251],[-58.48356,-34.55911],[-58.47359,-34.55354],[-58.46919,-34.55893]]},{"nombre":"Colegiales","comuna":13,"coords":[[-58.44905,-34.56786],[-58.44075,-34.57211],[-58.44397,-34.57537],[-58.43994,-34.57855],[-58.44445,-34.58318],[-58.4554,-34.57908],[-58.46023,-34.5783],[-58.46336,-34.57501],[-58.45771,-34.56953],[-58.45763,-34.569],[-58.45229,-34.56611],[-58.44905,-34.56786]]},{"nombre":"Constitucion","comuna":1,"coords":[[-58.37558,-34.62731],[-58.37905,-34.62934],[-58.37863,-34.6305],[-58.38015,-34.63304],[-58.38125,-34.63307],[-58.38134,-34.63085],[-58.3834,-34.63222],[-58.39036,-34.63413],[-58.3917,-34.61816],[-58.37736,-34.61746],[-58.37707,-34.6236],[-58.37558,-34.62731]]},{"nombre":"Flores","comuna":7,"coords":[[-58.45158,-34.63064],[-58.45438,-34.63151],[-58.45144,-34.63747],[-58.44425,-34.64281],[-58.44308,-34.64178],[-58.43742,-34.64736],[-58.43493,-34.64624],[-58.43043,-34.64988],[-58.43801,-34.65581],[-58.44333,-34.65119],[-58.44462,-34.65095],[-58.45464,-34.65083],[-58.45506,-34.6523],[-58.4604,-34.65681],[-58.46543,-34.6529],[-58.46703,-34.65147],[-58.463,-34.64617],[-58.46924,-34.6414],[-58.47781,-34.62239],[-58.46864,-34.61757],[-58.45945,-34.61389],[-58.45158,-34.63064]]},{"nombre":"Floresta","comuna":10,"coords":[[-58.47781,-34.62239],[-58.4713,-34.63666],[-58.47349,-34.63731],[-58.47607,-34.63894],[-58.4982,-34.62138],[-58.49264,-34.61673],[-58.48274,-34.62463],[-58.47781,-34.62239]]},{"nombre":"Liniers","comuna":9,"coords":[[-58.51067,-34.63482],[-58.50682,-34.63582],[-58.50567,-34.63672],[-58.51051,-34.63738],[-58.50982,-34.64001],[-58.5023,-34.64582],[-58.52577,-34.6569],[-58.52921,-34.6543],[-58.53036,-34.6348],[-58.52069,-34.63383],[-58.52024,-34.6328],[-58.51486,-34.63321],[-58.51067,-34.63482]]},{"nombre":"Mataderos","comuna":9,"coords":[[-58.4953,-34.64485],[-58.47882,-34.65785],[-58.48595,-34.66245],[-58.48895,-34.66335],[-58.49704,-34.67118],[-58.50253,-34.67451],[-58.52577,-34.6569],[-58.49714,-34.64341],[-58.4953,-34.64485]]},{"nombre":"Monserrat","comuna":1,"coords":[[-58.36773,-34.60691],[-58.36674,-34.61563],[-58.37743,-34.6163],[-58.37736,-34.61746],[-58.3917,-34.61816],[-58.39196,-34.6093],[-58.37156,-34.60789],[-58.37031,-34.6072],[-58.3702,-34.60658],[-58.36773,-34.60691]]},{"nombre":"Monte Castro","comuna":10,"coords":[[-58.49479,-34.61502],[-58.49264,-34.61673],[-58.4982,-34.62138],[-58.50349,-34.62404],[-58.50729,-34.6276],[-58.51165,-34.62428],[-58.51638,-34.62846],[-58.52164,-34.62441],[-58.51305,-34.61674],[-58.50019,-34.60913],[-58.49479,-34.61502]]},{"nombre":"Nueva Pompeya","comuna":4,"coords":[[-58.40275,-34.64706],[-58.40505,-34.6498],[-58.40105,-34.65999],[-58.40308,-34.65935],[-58.40723,-34.66],[-58.41119,-34.65857],[-58.41325,-34.65842],[-58.42003,-34.66017],[-58.42404,-34.66205],[-58.42675,-34.65868],[-58.43444,-34.65312],[-58.43043,-34.64988],[-58.43493,-34.64624],[-58.43211,-34.64517],[-58.43235,-34.64175],[-58.43093,-34.64145],[-58.41126,-34.6381],[-58.41344,-34.64346],[-58.4121,-34.64859],[-58.40275,-34.64706]]},{"nombre":"Nuñez","comuna":13,"coords":[[-58.45462,-34.5286],[-58.45405,-34.52931],[-58.45195,-34.53002],[-58.45172,-34.53063],[-58.45497,-34.53528],[-58.45944,-34.53781],[-58.44928,-34.54266],[-58.45412,-34.54899],[-58.45301,-34.55051],[-58.46919,-34.55893],[-58.47444,-34.55243],[-58.46819,-34.54895],[-58.47595,-34.53864],[-58.4638,-34.53327],[-58.45862,-34.52671],[-58.45672,-34.52675],[-58.45462,-34.5286]]},{"nombre":"Palermo","comuna":14,"coords":[[-58.40002,-34.56883],[-58.39993,-34.56919],[-58.39741,-34.56663],[-58.39654,-34.56688],[-58.39284,-34.57224],[-58.39521,-34.5722],[-58.40013,-34.56935],[-58.39972,-34.57081],[-58.40265,-34.57415],[-58.40115,-34.57574],[-58.39656,-34.57851],[-58.40055,-34.58448],[-58.40195,-34.58343],[-58.40618,-34.58346],[-58.41008,-34.58906],[-58.4144,-34.59406],[-58.416,-34.59786],[-58.42337,-34.59775],[-58.42935,-34.59475],[-58.44479,-34.58452],[-58.44343,-34.5818],[-58.43994,-34.57855],[-58.44397,-34.57537],[-58.44075,-34.57211],[-58.44905,-34.56786],[-58.44786,-34.56672],[-58.44254,-34.5637],[-58.44117,-34.56214],[-58.43541,-34.56254],[-58.43496,-34.5618],[-58.43798,-34.56176],[-58.44033,-34.56056],[-58.44139,-34.55882],[-58.44106,-34.5579],[-58.43411,-34.55396],[-58.43466,-34.5536],[-58.43443,-34.55306],[-58.43099,-34.55113],[-58.4294,-34.55096],[-58.42676,-34.55203],[-58.42567,-34.55197],[-58.42432,-34.54936],[-58.42472,-34.54902],[-58.42418,-34.54927],[-58.4257,-34.55216],[-58.4204,-34.55362],[-58.41596,-34.55422],[-58.41017,-34.55674],[-58.40957,-34.5566],[-58.40921,-34.55848],[-58.40391,-34.56348],[-58.39879,-34.56075],[-58.40394,-34.56357],[-58.40261,-34.56396],[-58.40112,-34.56334],[-58.40071,-34.56431],[-58.39921,-34.56367],[-58.39684,-34.56521],[-58.39695,-34.56592],[-58.40002,-34.56883]]},{"nombre":"Parque Avellaneda","comuna":9,"coords":[[-58.4604,-34.65681],[-58.46443,-34.66005],[-58.46766,-34.65752],[-58.46956,-34.65911],[-58.47057,-34.65843],[-58.47252,-34.66278],[-58.4953,-34.64485],[-58.47855,-34.637],[-58.47607,-34.63894],[-58.47349,-34.63731],[-58.4713,-34.63666],[-58.46924,-34.6414],[-58.463,-34.64617],[-58.46703,-34.65147],[-58.4604,-34.65681]]},{"nombre":"Parque Chacabuco","comuna":7,"coords":[[-58.42349,-34.6402],[-58.43235,-34.64175],[-58.43211,-34.64517],[-58.43742,-34.64736],[-58.44308,-34.64178],[-58.44425,-34.64281],[-58.45144,-34.63747],[-58.45438,-34.63151],[-58.45158,-34.63064],[-58.42676,-34.627],[-58.42349,-34.6402]]},{"nombre":"Parque Chas","comuna":15,"coords":[[-58.47082,-34.58745],[-58.47589,-34.59173],[-58.48471,-34.58912],[-58.48879,-34.58482],[-58.47899,-34.57913],[-58.47543,-34.57996],[-58.47357,-34.58177],[-58.47082,-34.58745]]},{"nombre":"Parque Patricios","comuna":4,"coords":[[-58.39036,-34.63413],[-58.38989,-34.64021],[-58.39148,-34.64083],[-58.3914,-34.64209],[-58.4005,-34.64592],[-58.40034,-34.64636],[-58.40109,-34.64674],[-58.4121,-34.64859],[-58.41344,-34.64346],[-58.41052,-34.63571],[-58.41152,-34.63286],[-58.41178,-34.63036],[-58.40837,-34.62952],[-58.39117,-34.62726],[-58.39036,-34.63413]]},{"nombre":"Paternal","comuna":15,"coords":[[-58.46683,-34.5906],[-58.46438,-34.59256],[-58.46562,-34.59671],[-58.45928,-34.59668],[-58.45624,-34.5976],[-58.45816,-34.60383],[-58.45894,-34.60438],[-58.46891,-34.60187],[-58.47402,-34.60532],[-58.4775,-34.60083],[-58.47639,-34.6002],[-58.47883,-34.59968],[-58.47573,-34.59131],[-58.47082,-34.58745],[-58.46683,-34.5906]]},{"nombre":"Puerto Madero","comuna":1,"coords":[[-58.35139,-34.61936],[-58.3527,-34.61978],[-58.35515,-34.61955],[-58.35602,-34.61761],[-58.3632,-34.62514],[-58.36579,-34.62399],[-58.3684,-34.60103],[-58.36952,-34.59833],[-58.36324,-34.59807],[-58.36345,-34.59713],[-58.35926,-34.59525],[-58.35594,-34.59513],[-58.35344,-34.5967],[-58.34682,-34.60234],[-58.34588,-34.60671],[-58.34087,-34.61067],[-58.33988,-34.6161],[-58.34085,-34.61694],[-58.34486,-34.61773],[-58.34917,-34.61699],[-58.35017,-34.61751],[-58.34997,-34.61872],[-58.35073,-34.61856],[-58.35038,-34.61894],[-58.35139,-34.61936]]},{"nombre":"Recoleta","comuna":2,"coords":[[-58.37556,-34.57745],[-58.37672,-34.57755],[-58.37398,-34.57911],[-58.37513,-34.58053],[-58.37617,-34.57996],[-58.37984,-34.58017],[-58.38324,-34.57832],[-58.38659,-34.57812],[-58.38987,-34.57821],[-58.39165,-34.58084],[-58.38697,-34.58356],[-58.38369,-34.58751],[-58.38795,-34.59165],[-58.38687,-34.5993],[-58.39873,-34.59977],[-58.40201,-34.59937],[-58.40451,-34.59804],[-58.416,-34.59786],[-58.4144,-34.59406],[-58.41008,-34.58906],[-58.40618,-34.58346],[-58.40195,-34.58343],[-58.40055,-34.58448],[-58.39656,-34.57851],[-58.40115,-34.57574],[-58.40265,-34.57415],[-58.39972,-34.57081],[-58.40013,-34.56935],[-58.39521,-34.5722],[-58.39299,-34.57198],[-58.38794,-34.57488],[-58.38665,-34.57323],[-58.39127,-34.57061],[-58.39032,-34.56934],[-58.38147,-34.56843],[-58.381,-34.56858],[-58.38071,-34.57012],[-58.38036,-34.5701],[-58.3801,-34.56823],[-58.36817,-34.56724],[-58.37979,-34.56831],[-58.38023,-34.5687],[-58.38023,-34.56985],[-58.38003,-34.57037],[-58.37878,-34.57036],[-58.37616,-34.57166],[-58.36176,-34.57065],[-58.35986,-34.57165],[-58.3621,-34.57075],[-58.37615,-34.57181],[-58.37117,-34.5749],[-58.37919,-34.57039],[-58.38036,-34.57048],[-58.38051,-34.57104],[-58.37831,-34.57231],[-58.3783,-34.57276],[-58.38361,-34.57322],[-58.38182,-34.57442],[-58.37544,-34.57393],[-58.37075,-34.57663],[-58.37074,-34.57707],[-58.37556,-34.57745]]},{"nombre":"Retiro","comuna":1,"coords":[[-58.35649,-34.59503],[-58.35926,-34.59525],[-58.36345,-34.59713],[-58.36324,-34.59807],[-58.38687,-34.5993],[-58.38795,-34.59165],[-58.38369,-34.58751],[-58.38697,-34.58356],[-58.39165,-34.58084],[-58.38987,-34.57821],[-58.38358,-34.57824],[-58.37984,-34.58017],[-58.37617,-34.57996],[-58.37513,-34.58053],[-58.37398,-34.57911],[-58.37672,-34.57755],[-58.37605,-34.57749],[-58.37429,-34.57871],[-58.36793,-34.57822],[-58.36532,-34.57971],[-58.36525,-34.58016],[-58.3706,-34.58079],[-58.36898,-34.58173],[-58.36163,-34.58115],[-58.36142,-34.58297],[-58.36615,-34.58356],[-58.36495,-34.5845],[-58.35992,-34.58412],[-58.35973,-34.58592],[-58.36365,-34.58625],[-58.36353,-34.58746],[-58.35961,-34.58719],[-58.35946,-34.58808],[-58.36085,-34.58857],[-58.36075,-34.58894],[-58.36089,-34.58857],[-58.368,-34.59001],[-58.36791,-34.59043],[-58.36652,-34.59098],[-58.36437,-34.59427],[-58.36483,-34.59446],[-58.36709,-34.5914],[-58.36639,-34.59299],[-58.36693,-34.5932],[-58.36787,-34.59196],[-58.36715,-34.59331],[-58.36908,-34.59416],[-58.36791,-34.59748],[-58.3665,-34.59742],[-58.36609,-34.59821],[-58.36616,-34.59739],[-58.36384,-34.5972],[-58.36441,-34.59551],[-58.36411,-34.59532],[-58.36125,-34.59528],[-58.36385,-34.59549],[-58.36342,-34.59666],[-58.36033,-34.59547],[-58.36038,-34.59508],[-58.3611,-34.59511],[-58.35415,-34.59467],[-58.35094,-34.59519],[-58.35412,-34.59471],[-58.35685,-34.59494],[-58.35649,-34.59503]]},{"nombre":"Saavedra","comuna":12,"coords":[[-58.47359,-34.55354],[-58.48341,-34.55904],[-58.49099,-34.56266],[-58.49193,-34.56131],[-58.5086,-34.5694],[-58.50904,-34.57],[-58.50988,-34.56927],[-58.50055,-34.5495],[-58.47595,-34.53864],[-58.46819,-34.54895],[-58.47444,-34.55243],[-58.47359,-34.55354]]},{"nombre":"San Cristobal","comuna":3,"coords":[[-58.39117,-34.62726],[-58.40837,-34.62952],[-58.41178,-34.63036],[-58.41205,-34.62298],[-58.41255,-34.62065],[-58.40352,-34.61884],[-58.3917,-34.61816],[-58.39117,-34.62726]]},{"nombre":"San Nicolas","comuna":1,"coords":[[-58.36773,-34.60691],[-58.3702,-34.60658],[-58.37031,-34.6072],[-58.37156,-34.60789],[-58.39196,-34.6093],[-58.39294,-34.59964],[-58.36952,-34.59833],[-58.3684,-34.60103],[-58.36773,-34.60691]]},{"nombre":"San Telmo","comuna":1,"coords":[[-58.36346,-34.62513],[-58.36798,-34.6252],[-58.36795,-34.62715],[-58.37066,-34.6295],[-58.37097,-34.62665],[-58.37457,-34.6268],[-58.37558,-34.62731],[-58.37707,-34.6236],[-58.37743,-34.6163],[-58.36674,-34.61563],[-58.36579,-34.62399],[-58.36346,-34.62513]]},{"nombre":"Velez Sarsfield","comuna":10,"coords":[[-58.47855,-34.637],[-58.48781,-34.6413],[-58.49332,-34.63697],[-58.49312,-34.63652],[-58.4938,-34.63665],[-58.49998,-34.63178],[-58.50104,-34.63221],[-58.50729,-34.6276],[-58.50349,-34.62404],[-58.4982,-34.62138],[-58.47855,-34.637]]},{"nombre":"Versalles","comuna":10,"coords":[[-58.52164,-34.62441],[-58.50839,-34.6346],[-58.51067,-34.63482],[-58.51486,-34.63321],[-58.52024,-34.6328],[-58.52069,-34.63383],[-58.53036,-34.6348],[-58.5308,-34.62753],[-58.52283,-34.62349],[-58.52164,-34.62441]]},{"nombre":"Villa Crespo","comuna":15,"coords":[[-58.42337,-34.59775],[-58.42778,-34.59833],[-58.42943,-34.59913],[-58.43224,-34.60214],[-58.4392,-34.60559],[-58.44625,-34.60762],[-58.45894,-34.60438],[-58.45816,-34.60383],[-58.45624,-34.5976],[-58.45549,-34.59784],[-58.4506,-34.5944],[-58.43854,-34.58867],[-58.42695,-34.59622],[-58.42337,-34.59775]]},{"nombre":"Villa Del Parque","comuna":11,"coords":[[-58.47883,-34.59968],[-58.47639,-34.6002],[-58.4775,-34.60083],[-58.47402,-34.60532],[-58.47762,-34.60736],[-58.48865,-34.61014],[-58.49479,-34.61502],[-58.50617,-34.60238],[-58.49713,-34.59679],[-58.48346,-34.59776],[-58.47883,-34.59968]]},{"nombre":"Villa Devoto","comuna":11,"coords":[[-58.50347,-34.59396],[-58.50308,-34.59439],[-58.50354,-34.59446],[-58.49718,-34.59682],[-58.50617,-34.60238],[-58.50019,-34.60913],[-58.51305,-34.61674],[-58.51695,-34.62022],[-58.52947,-34.6109],[-58.51554,-34.58127],[-58.51452,-34.58175],[-58.50347,-34.59396]]},{"nombre":"Villa Gral. Mitre","comuna":11,"coords":[[-58.45894,-34.60438],[-58.45848,-34.6045],[-58.46271,-34.60738],[-58.45945,-34.61389],[-58.47162,-34.61916],[-58.48041,-34.60813],[-58.47637,-34.60675],[-58.46891,-34.60187],[-58.45894,-34.60438]]},{"nombre":"Villa Lugano","comuna":8,"coords":[[-58.46443,-34.66005],[-58.46845,-34.66366],[-58.4702,-34.66361],[-58.47037,-34.66444],[-58.46477,-34.66888],[-58.46323,-34.66939],[-58.45955,-34.67354],[-58.45773,-34.67439],[-58.45064,-34.68004],[-58.4634,-34.6918],[-58.4758,-34.68214],[-58.48336,-34.68896],[-58.50253,-34.67451],[-58.49704,-34.67118],[-58.48895,-34.66335],[-58.48595,-34.66245],[-58.47882,-34.65785],[-58.47252,-34.66278],[-58.47057,-34.65843],[-58.46956,-34.65911],[-58.46766,-34.65752],[-58.46443,-34.66005]]},{"nombre":"Villa Luro","comuna":10,"coords":[[-58.50729,-34.6276],[-58.50104,-34.63221],[-58.49998,-34.63178],[-58.4938,-34.63665],[-58.49312,-34.63652],[-58.49332,-34.63697],[-58.48781,-34.6413],[-58.4953,-34.64485],[-58.49714,-34.64341],[-58.5023,-34.64582],[-58.50982,-34.64001],[-58.51051,-34.63738],[-58.50567,-34.63672],[-58.50682,-34.63582],[-58.51067,-34.63482],[-58.50839,-34.6346],[-58.51638,-34.62846],[-58.51165,-34.62428],[-58.50729,-34.6276]]},{"nombre":"Villa Ortuzar","comuna":15,"coords":[[-58.46336,-34.57501],[-58.46023,-34.5783],[-58.46053,-34.5783],[-58.46038,-34.58553],[-58.46187,-34.58605],[-58.46683,-34.5906],[-58.47081,-34.58747],[-58.47357,-34.58177],[-58.47543,-34.57996],[-58.47899,-34.57913],[-58.46737,-34.5725],[-58.46336,-34.57501]]},{"nombre":"Villa Pueyrredon","comuna":12,"coords":[[-58.50904,-34.57],[-58.50295,-34.57356],[-58.48879,-34.58482],[-58.50347,-34.59396],[-58.51452,-34.58175],[-58.51554,-34.58127],[-58.50988,-34.56927],[-58.50904,-34.57]]},{"nombre":"Villa Real","comuna":10,"coords":[[-58.51695,-34.62022],[-58.52164,-34.62441],[-58.52283,-34.62349],[-58.5308,-34.62753],[-58.53152,-34.6155],[-58.52947,-34.6109],[-58.51695,-34.62022]]},{"nombre":"Villa Riachuelo","comuna":8,"coords":[[-58.4443,-34.68494],[-58.46159,-34.70536],[-58.48336,-34.68896],[-58.4758,-34.68214],[-58.4634,-34.6918],[-58.45114,-34.68054],[-58.45097,-34.68087],[-58.44994,-34.6805],[-58.4443,-34.68494]]},{"nombre":"Villa Santa Rita","comuna":11,"coords":[[-58.47162,-34.61916],[-58.48274,-34.62463],[-58.49479,-34.61502],[-58.48865,-34.61014],[-58.48041,-34.60813],[-58.47162,-34.61916]]},{"nombre":"Villa Soldati","comuna":8,"coords":[[-58.43444,-34.65312],[-58.42675,-34.65868],[-58.42404,-34.66205],[-58.4274,-34.66488],[-58.4443,-34.68494],[-58.44994,-34.6805],[-58.4511,-34.68082],[-58.45078,-34.67984],[-58.45773,-34.67439],[-58.45955,-34.67354],[-58.46323,-34.66939],[-58.46477,-34.66888],[-58.47041,-34.66437],[-58.4702,-34.66361],[-58.46845,-34.66366],[-58.45533,-34.65254],[-58.45464,-34.65083],[-58.44333,-34.65119],[-58.43801,-34.65581],[-58.43444,-34.65312]]},{"nombre":"Villa Urquiza","comuna":12,"coords":[[-58.47299,-34.56644],[-58.47337,-34.56667],[-58.46808,-34.57291],[-58.48879,-34.58482],[-58.50295,-34.57356],[-58.50904,-34.57],[-58.5086,-34.5694],[-58.49193,-34.56131],[-58.49099,-34.56266],[-58.48356,-34.55911],[-58.48116,-34.56251],[-58.47906,-34.56394],[-58.47619,-34.56686],[-58.47512,-34.56622],[-58.4746,-34.56682],[-58.47299,-34.56644]]}];

/* ============================================================
   3. CATEGORÍAS DE LUGARES
   ============================================================ */
const CAT = {
  "Teatro / Cultura":     { color: "#f59e0b", icon: "🎭" },
  "Tango / Gastronomía":  { color: "#ec4899", icon: "💃" },
  "Paseo Urbano":         { color: "#06b6d4", icon: "🌉" },
  "Avenida Cultural":     { color: "#a78bfa", icon: "🎪" },
  "Ciencia / Cultura":    { color: "#34d399", icon: "🔭" },
  "Gastronomía / Cultura":{ color: "#fb923c", icon: "🥢" },
  "Vida Nocturna":        { color: "#f472b6", icon: "🍻" },
  "Centro Cultural":      { color: "#818cf8", icon: "🎨" },
  "Turismo Histórico":    { color: "#fbbf24", icon: "📸" },
  "Espacio Verde":        { color: "#4ade80", icon: "🌿" },
};
const catOf = c => CAT[c] || { color: "#6c63ff", icon: "📍" };

/* ============================================================
   4. DATOS DE LUGARES (embebidos)
   ============================================================ */
const LUGARES = [
  { id:1,  nombre:"Teatro Colón",       categoria:"Teatro / Cultura",      barrio:"San Nicolás",   ubicacion_exacta:"Cerrito 628",               coordenadas:{latitud:-34.6011,longitud:-58.3831}, horarios_nocturnos:"20:00 a 23:00",                     precio:"Alto",          accesibilidad:"Alta",  recomendaciones:["Reservar con anticipación","Llegar temprano al hall","Ideal para fotografía nocturna"], informacion:"El Teatro Colón es considerado uno de los teatros líricos más importantes del mundo por su acústica y arquitectura monumental. Por la noche, el edificio iluminado sobre la Av. 9 de Julio genera una atmósfera elegante e histórica.",           ideal_para:["Turistas","Parejas","Amantes de la cultura"] },
  { id:2,  nombre:"El Querandí",        categoria:"Tango / Gastronomía",   barrio:"San Telmo",     ubicacion_exacta:"Perú 322",                  coordenadas:{latitud:-34.6122,longitud:-58.3734}, horarios_nocturnos:"20:00 a 23:30",                     precio:"Alto",          accesibilidad:"Media", recomendaciones:["Ideal para primera experiencia de tango","Reservar con anticipación","Elegir opción con cena incluida"], informacion:"El Querandí funciona en un edificio histórico con decoración clásica y ambiente íntimo. Combina tango, música en vivo y relatos históricos sobre Buenos Aires.",                                         ideal_para:["Turistas internacionales","Parejas","Amantes del tango"] },
  { id:3,  nombre:"Puerto Madero",      categoria:"Paseo Urbano",          barrio:"Puerto Madero", ubicacion_exacta:"Zona Puente de la Mujer",   coordenadas:{latitud:-34.6118,longitud:-58.3631}, horarios_nocturnos:"Acceso libre toda la noche",       precio:"Sin costo",     accesibilidad:"Alta",  recomendaciones:["Ideal para caminatas nocturnas","Excelente para fotografía urbana","Cenar frente al río"], informacion:"Puerto Madero es el barrio más moderno de Buenos Aires. De noche se transforma con las luces reflejadas en los diques. El Puente de la Mujer y la Costanera Sur son sus principales atractivos.",              ideal_para:["Turistas","Parejas","Fotógrafos"] },
  { id:4,  nombre:"Avenida Corrientes", categoria:"Avenida Cultural",      barrio:"San Nicolás",   ubicacion_exacta:"Tramo Callao — 9 de Julio", coordenadas:{latitud:-34.6037,longitud:-58.3925}, horarios_nocturnos:"Actividad intensa hasta madrugada", precio:"Variable",      accesibilidad:"Alta",  recomendaciones:["Combinar teatro y pizza","Recorrer librerías nocturnas","Ideal para caminar"],             informacion:"La Avenida Corrientes es la calle que nunca duerme. Sus teatros, bares y pizzerías generan un ambiente dinámico incluso después de medianoche, con carteles luminosos que recuerdan a Broadway.",               ideal_para:["Turistas","Amigos","Amantes del teatro"] },
  { id:5,  nombre:"Planetario Galileo", categoria:"Ciencia / Cultura",     barrio:"Palermo",       ubicacion_exacta:"Av. Sarmiento s/n",         coordenadas:{latitud:-34.5692,longitud:-58.4115}, horarios_nocturnos:"Funciones según agenda",            precio:"Bajo",          accesibilidad:"Alta",  recomendaciones:["Ir en noches despejadas","Consultar agenda astronómica","Ideal para familias"],             informacion:"El Planetario, rodeado por los Bosques de Palermo, adquiere un aspecto futurista de noche. Ofrece observaciones astronómicas con telescopios abiertos al público en un entorno verde y tranquilo.",              ideal_para:["Familias","Estudiantes","Parejas"] },
  { id:6,  nombre:"Barrio Chino",       categoria:"Gastronomía / Cultura", barrio:"Belgrano",      ubicacion_exacta:"Arribeños y Mendoza",       coordenadas:{latitud:-34.5615,longitud:-58.4497}, horarios_nocturnos:"18:00 a 00:00",                     precio:"Bajo/Medio",    accesibilidad:"Alta",  recomendaciones:["Probar comida callejera asiática","Visitar supermercados orientales","Ideal para fotografías"], informacion:"El Barrio Chino ofrece una experiencia nocturna única con sus luces, faroles rojos y gastronomía asiática. Los locales de ramen, bubble tea y comida coreana generan un ambiente muy activo los fines de semana.", ideal_para:["Jóvenes","Turistas","Foodies"] },
  { id:7,  nombre:"Plaza Serrano",      categoria:"Vida Nocturna",         barrio:"Palermo",       ubicacion_exacta:"Serrano y Honduras",        coordenadas:{latitud:-34.5881,longitud:-58.4299}, horarios_nocturnos:"Bares hasta 03:00 o más",           precio:"Medio",         accesibilidad:"Alta",  recomendaciones:["Ideal para grupos de amigos","Recorrer bares temáticos","Visitar fines de semana"],         informacion:"Plaza Serrano es uno de los principales centros de vida nocturna de Buenos Aires. Rodeada de bares, cervecerías y restaurantes con estilos variados, sus calles se llenan de música y movimiento.",               ideal_para:["Jóvenes","Grupos de amigos","Turistas"] },
  { id:8,  nombre:"Usina del Arte",     categoria:"Centro Cultural",       barrio:"La Boca",       ubicacion_exacta:"Caffarena 1",               coordenadas:{latitud:-34.6283,longitud:-58.3649}, horarios_nocturnos:"Hasta aprox. 23:00",                precio:"Gratuito/Bajo", accesibilidad:"Alta",  recomendaciones:["Consultar agenda cultural","Ideal para conciertos","Combinar con paseo por La Boca"],        informacion:"La Usina del Arte es uno de los centros culturales más importantes del sur de la ciudad. Su edificio industrial restaurado alberga conciertos, muestras y espectáculos gratuitos con una atmósfera muy especial de noche.", ideal_para:["Familias","Turistas","Amantes del arte"] },
  { id:9,  nombre:"Caminito",           categoria:"Turismo Histórico",     barrio:"La Boca",       ubicacion_exacta:"Caminito y Magallanes",     coordenadas:{latitud:-34.6356,longitud:-58.3648}, horarios_nocturnos:"Recomendable hasta las 22:00",      precio:"Sin costo",     accesibilidad:"Media", recomendaciones:["Ir acompañado","Mantenerse en zonas turísticas","Ideal para fotografía"],                    informacion:"Caminito conserva su identidad colorida y artística incluso de noche. Muchos restaurantes y espacios de tango continúan abiertos, con música en vivo y espectáculos callejeros.",                                  ideal_para:["Turistas","Fotógrafos","Parejas"] },
  { id:10, nombre:"Parque Centenario",  categoria:"Espacio Verde",         barrio:"Caballito",     ubicacion_exacta:"Av. Díaz Vélez y Marechal", coordenadas:{latitud:-34.6067,longitud:-58.4356}, horarios_nocturnos:"Bares cercanos hasta madrugada",    precio:"Sin costo",     accesibilidad:"Alta",  recomendaciones:["Combinar con bares cercanos","Ideal para caminatas","Visitar cafés de la zona"],             informacion:"Parque Centenario es el espacio verde en el centro geográfico de Buenos Aires. De noche el movimiento se traslada a las avenidas cercanas con bares y restaurantes modernos.",                                      ideal_para:["Familias","Amigos","Estudiantes"] },
];

/* ============================================================
   5. ESTADO GLOBAL
   ============================================================ */
const STATE = {
  filtro: 'todos',
  selectedId: null,
  searchQuery: '',
  zoom: 1,
  panX: 0,
  panY: 0,
  isDragging: false,
  dragStart: null,
  favoritos: new Set(JSON.parse(localStorage.getItem('sdc-favoritos') || '[]')),
};

function saveFavoritos() {
  localStorage.setItem('sdc-favoritos', JSON.stringify([...STATE.favoritos]));
}

/* ============================================================
   6. PROYECCIÓN — Mercator simplificado a coordenadas SVG
   ============================================================ */
const SVG_W = 860, SVG_H = 760;

// Límites de CABA con pequeño padding
const BOUNDS = {
  minLng: -58.542, maxLng: -58.330,
  minLat: -34.715, maxLat: -34.525,
};

function project(lng, lat) {
  const x = (lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng) * SVG_W;
  const y = (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * SVG_H;
  return [x, y];
}

/**
 * Convierte un array de coordenadas [lng, lat] a un path SVG "M...L...Z".
 * Acepta tanto anillo simple como anillo doble (GeoJSON Polygon).
 */
function coordsToPath(coords) {
  return coords
    .map(([lng, lat], i) => {
      const [x, y] = project(lng, lat);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ') + ' Z';
}

/** Calcula el centroide promedio de un polígono proyectado */
function centroid(coords) {
  let sx = 0, sy = 0;
  coords.forEach(([lng, lat]) => {
    const [x, y] = project(lng, lat);
    sx += x; sy += y;
  });
  return [sx / coords.length, sy / coords.length];
}

/* ============================================================
   7. CONSTRUCCIÓN DEL SVG
   ============================================================ */
const NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs = {}, text = '') {
  const e = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  if (text) e.textContent = text;
  return e;
}

function buildMap() {
  const canvas = document.getElementById('map-canvas');
  canvas.innerHTML = '';

  /* ── SVG raíz ────────────────────────────────────────────── */
  const svg = svgEl('svg', {
    id: 'mapa-svg',
    viewBox: `0 0 ${SVG_W} ${SVG_H}`,
    xmlns: NS,
    'aria-hidden': 'true',
  });

  /* ── Defs ─────────────────────────────────────────────────── */
  const defs = svgEl('defs');
  defs.innerHTML = `
    <radialGradient id="bg-grad" cx="45%" cy="55%" r="65%">
      <stop offset="0%" stop-color="#141726"/>
      <stop offset="100%" stop-color="#080a10"/>
    </radialGradient>
    <pattern id="grid-pat" width="40" height="40" patternUnits="userSpaceOnUse" opacity="0.035">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6c63ff" stroke-width="0.5"/>
    </pattern>
    <filter id="f-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="f-marker" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="rgba(0,0,0,.7)"/>
    </filter>
  `;
  svg.appendChild(defs);

  /* ── Fondo ────────────────────────────────────────────────── */
  svg.appendChild(svgEl('rect', { width: SVG_W, height: SVG_H, fill: 'url(#bg-grad)' }));
  svg.appendChild(svgEl('rect', { width: SVG_W, height: SVG_H, fill: 'url(#grid-pat)' }));

  /* Texto del río */
  svg.appendChild(svgEl('text', {
    x: SVG_W - 40, y: 90,
    'text-anchor': 'middle',
    fill: '#7dd3fc', 'fill-opacity': '0.35',
    'font-size': '11', 'font-style': 'italic',
    'font-family': 'Georgia, serif', 'pointer-events': 'none',
    transform: `rotate(-15, ${SVG_W - 40}, 90)`,
  }, 'Río de la Plata'));

  /* ── Grupo principal (objetivo de zoom/pan) ──────────────── */
  const g = svgEl('g', { id: 'mapa-g' });
  svg.appendChild(g);

  /* ── Capa 1: rellenos de barrios ──────────────────────────── */
  const gFills = svgEl('g', { id: 'layer-fills' });

  GEO_BARRIOS.forEach(barrio => {
    const comuna = COMUNAS[barrio.comuna];
    const color  = comuna ? comuna.color : '#4a5568';
    const path   = svgEl('path', {
      d: coordsToPath(barrio.coords),
      fill: color,
      'fill-opacity': '0.14',
      stroke: 'none',
      'data-nombre': barrio.nombre,
      'data-comuna': barrio.comuna,
      class: 'barrio-fill',
    });
    path.addEventListener('mouseenter', e => showBarrioTooltip(e, barrio.nombre, barrio.comuna));
    path.addEventListener('mousemove',  moveBarrioTooltip);
    path.addEventListener('mouseleave', hideBarrioTooltip);
    gFills.appendChild(path);
  });
  g.appendChild(gFills);

  /* ── Capa 2: bordes finos entre barrios (misma topología) ─── */
  // Se renderiza un path por barrio con stroke fino del color de la comuna.
  // Como los barrios comparten vértices reales del GeoJSON, los bordes
  // coinciden perfectamente: no hay superposiciones ni cuadros fantasma.
  const gBarrioBorders = svgEl('g', { id: 'layer-barrio-borders', 'pointer-events': 'none' });

  GEO_BARRIOS.forEach(barrio => {
    const comuna = COMUNAS[barrio.comuna];
    const color  = comuna ? comuna.color : '#4a5568';
    gBarrioBorders.appendChild(svgEl('path', {
      d: coordsToPath(barrio.coords),
      fill: 'none',
      stroke: color,
      'stroke-opacity': '0.35',
      'stroke-width': '0.7',
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
    }));
  });
  g.appendChild(gBarrioBorders);

  /* ── Capa 3: bordes gruesos de comuna (glow) ─────────────── */
  // Se dibuja el contorno de cada barrio nuevamente pero más grueso y brillante,
  // para resaltar las fronteras de cada comuna sobre los barrios interiores.
  const gComunaBorders = svgEl('g', { id: 'layer-comuna-borders', 'pointer-events': 'none' });

  GEO_BARRIOS.forEach(barrio => {
    const comuna = COMUNAS[barrio.comuna];
    if (!comuna) return;
    gComunaBorders.appendChild(svgEl('path', {
      d: coordsToPath(barrio.coords),
      fill: 'none',
      stroke: comuna.color,
      'stroke-opacity': '0.8',
      'stroke-width': '1.5',
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
      filter: 'url(#f-glow)',
      class: 'comuna-border',
    }));
  });
  g.appendChild(gComunaBorders);

  /* ── Capa 4: etiquetas de barrios ────────────────────────── */
  const gLabels = svgEl('g', { id: 'layer-labels', 'pointer-events': 'none' });

  GEO_BARRIOS.forEach(barrio => {
    const [cx, cy] = centroid(barrio.coords);
    gLabels.appendChild(svgEl('text', {
      x: cx, y: cy,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      fill: '#e2e8f0',
      'fill-opacity': '0.45',
      'font-size': '6.5',
      'font-family': "'Segoe UI', system-ui, sans-serif",
      'font-weight': '500',
      'letter-spacing': '0.04em',
    }, barrio.nombre));
  });
  g.appendChild(gLabels);

  /* ── Capa 5: marcadores de lugares ──────────────────────── */
  const gMarkers = svgEl('g', { id: 'layer-markers' });
  const visibles  = getFilteredLugares();

  visibles.forEach(lugar => {
    const [x, y] = project(lugar.coordenadas.longitud, lugar.coordenadas.latitud);
    const cfg    = catOf(lugar.categoria);
    const isFav  = STATE.favoritos.has(lugar.id);

    const gM = svgEl('g', {
      class: 'marker-g',
      'data-id': lugar.id,
      filter: 'url(#f-marker)',
    });

    // Halo pulsante
    gM.appendChild(svgEl('circle', {
      cx: x, cy: y, r: 14,
      fill: cfg.color, 'fill-opacity': '0.12',
      stroke: cfg.color, 'stroke-width': '1', 'stroke-opacity': '0.25',
      class: 'marker-pulse',
    }));

    // Pin
    const pin = svgEl('circle', {
      cx: x, cy: y - 2, r: 11,
      fill: cfg.color, 'fill-opacity': '0.92',
      class: 'marker-pin',
    });
    gM.appendChild(pin);

    // Ícono
    gM.appendChild(svgEl('text', {
      x: x, y: y + 1.5,
      'text-anchor': 'middle', 'dominant-baseline': 'middle',
      'font-size': '11', 'pointer-events': 'none',
    }, cfg.icon));

    // Estrella de favorito
    if (isFav) {
      gM.appendChild(svgEl('text', {
        x: x + 9, y: y - 12, 'font-size': '9', 'pointer-events': 'none',
      }, '⭐'));
    }

    // Tooltip flotante
    const gTT   = svgEl('g', { class: 'marker-tooltip', opacity: '0', 'pointer-events': 'none' });
    const tW    = Math.min(lugar.nombre.length * 6.4 + 18, 190);
    gTT.appendChild(svgEl('rect', {
      x: x - tW/2, y: y - 38, width: tW, height: 20,
      rx: 10, fill: 'rgba(8,10,16,.93)', stroke: cfg.color, 'stroke-width': '1',
    }));
    gTT.appendChild(svgEl('text', {
      x: x, y: y - 24,
      'text-anchor': 'middle', 'dominant-baseline': 'middle',
      fill: '#fff', 'font-size': '10',
      'font-family': "'Segoe UI', system-ui, sans-serif",
      'font-weight': '600',
    }, lugar.nombre));
    gM.appendChild(gTT);

    // Eventos del marcador
    gM.addEventListener('mouseenter', () => { gTT.setAttribute('opacity', '1'); pin.setAttribute('r', '13'); });
    gM.addEventListener('mouseleave', () => { gTT.setAttribute('opacity', '0'); pin.setAttribute('r', '11'); });
    gM.addEventListener('click', e => { e.stopPropagation(); selectPlace(lugar.id); });

    gMarkers.appendChild(gM);
  });
  g.appendChild(gMarkers);

  // Aplicar transformación actual e inicializar interacciones
  applyTransform(g);
  setupZoomPan(svg, g);

  // Animaciones CSS inyectadas en el SVG
  const style = document.createElementNS(NS, 'style');
  style.textContent = `
    .marker-pulse { animation: pulse 2.6s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{r:12;opacity:.22} 50%{r:20;opacity:.06} }
    .marker-g { transition: opacity .2s; }
    .marker-tooltip { transition: opacity .14s; }
    .barrio-fill { transition: fill-opacity .18s; }
    .barrio-fill:hover { fill-opacity:.36!important; cursor:default; }
  `;
  svg.appendChild(style);

  canvas.appendChild(svg);
  return svg;
}

/* ============================================================
   8. FILTROS Y BÚSQUEDA
   ============================================================ */
function getFilteredLugares() {
  return LUGARES.filter(l => {
    const matchFiltro = STATE.filtro === 'todos' || l.categoria === STATE.filtro;
    const q = STATE.searchQuery.toLowerCase();
    const matchSearch = !q || l.nombre.toLowerCase().includes(q) || l.barrio.toLowerCase().includes(q);
    return matchFiltro && matchSearch;
  });
}

function buildFilters() {
  const nav  = document.getElementById('filter-nav');
  const cats = [...new Set(LUGARES.map(l => l.categoria))].sort();

  const makeBtn = (label, value, color) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (value === STATE.filtro ? ' active' : '');
    btn.dataset.value = value;

    const dot   = document.createElement('span');
    dot.className = 'filter-btn__dot';
    dot.style.background = color;

    const count = document.createElement('span');
    count.className = 'filter-btn__count';
    count.textContent = value === 'todos' ? LUGARES.length : LUGARES.filter(l => l.categoria === value).length;

    if (value === STATE.filtro) {
      btn.style.background = color + '22';
      btn.style.borderColor = color + '66';
      btn.style.color = color;
    }

    btn.appendChild(dot);
    btn.appendChild(document.createTextNode(' ' + label));
    btn.appendChild(count);

    btn.addEventListener('click', () => {
      STATE.filtro = value;
      nav.querySelectorAll('.filter-btn').forEach(b => {
        const bCat = b.dataset.value;
        const bCfg = bCat === 'todos' ? { color: '#6c63ff' } : catOf(bCat);
        const isActive = bCat === value;
        b.className = 'filter-btn' + (isActive ? ' active' : '');
        b.style.background   = isActive ? bCfg.color + '22' : '';
        b.style.borderColor  = isActive ? bCfg.color + '66' : '';
        b.style.color        = isActive ? bCfg.color : '';
      });
      buildMap();
      updateCount();
    });

    return btn;
  };

  nav.appendChild(makeBtn('Todos los lugares', 'todos', '#6c63ff'));
  cats.forEach(cat => nav.appendChild(makeBtn(cat, cat, catOf(cat).color)));
}

function buildLegend() {
  const legend = document.getElementById('map-legend');
  Object.values(COMUNAS).forEach(c => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <span class="legend-item__swatch" style="background:${c.color}"></span>
      <span>${c.nombre}</span>
    `;
    legend.appendChild(item);
  });
}

function updateCount() {
  document.getElementById('place-count').textContent = getFilteredLugares().length;
}

function setupSearch() {
  let timer;
  document.getElementById('search-input').addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      STATE.searchQuery = e.target.value.trim();
      buildMap();
      updateCount();
    }, 200);
  });
}

/* ============================================================
   9. TRANSFORMACIÓN Y ZOOM/PAN
   ============================================================ */
function applyTransform(g) {
  g.setAttribute('transform', `translate(${STATE.panX},${STATE.panY}) scale(${STATE.zoom})`);
}

function setupZoomPan(svg, g) {
  // Rueda
  svg.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.13 : 0.885;
    const rect   = svg.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (SVG_W / rect.width);
    const my = (e.clientY - rect.top)  * (SVG_H / rect.height);
    const newZoom = Math.min(Math.max(STATE.zoom * factor, 0.55), 8);
    STATE.panX = mx - (mx - STATE.panX) * (newZoom / STATE.zoom);
    STATE.panY = my - (my - STATE.panY) * (newZoom / STATE.zoom);
    STATE.zoom = newZoom;
    applyTransform(g);
  }, { passive: false });

  // Arrastre con mouse
  svg.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    STATE.isDragging = true;
    STATE.dragStart  = { x: e.clientX - STATE.panX, y: e.clientY - STATE.panY };
    svg.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', e => {
    if (!STATE.isDragging) return;
    STATE.panX = e.clientX - STATE.dragStart.x;
    STATE.panY = e.clientY - STATE.dragStart.y;
    applyTransform(g);
  });
  window.addEventListener('mouseup', () => {
    if (!STATE.isDragging) return;
    STATE.isDragging = false;
    svg.style.cursor = 'grab';
  });
  svg.style.cursor = 'grab';

  // Touch
  let lastTouches = [];
  svg.addEventListener('touchstart', e => { lastTouches = [...e.touches]; }, { passive: true });
  svg.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && lastTouches.length >= 1) {
      STATE.panX += e.touches[0].clientX - lastTouches[0].clientX;
      STATE.panY += e.touches[0].clientY - lastTouches[0].clientY;
      applyTransform(g);
    } else if (e.touches.length === 2 && lastTouches.length === 2) {
      const d0 = Math.hypot(lastTouches[0].clientX - lastTouches[1].clientX, lastTouches[0].clientY - lastTouches[1].clientY);
      const d1 = Math.hypot(e.touches[0].clientX   - e.touches[1].clientX,  e.touches[0].clientY   - e.touches[1].clientY);
      STATE.zoom = Math.min(Math.max(STATE.zoom * (d1 / d0), 0.55), 8);
      applyTransform(g);
    }
    lastTouches = [...e.touches];
  }, { passive: false });

  // Doble clic: reset
  svg.addEventListener('dblclick', () => {
    STATE.zoom = 1; STATE.panX = 0; STATE.panY = 0;
    applyTransform(g);
  });

  // Teclado
  svg.addEventListener('keydown', e => {
    const step = 30;
    if (e.key === 'ArrowLeft')  { STATE.panX += step; applyTransform(g); }
    if (e.key === 'ArrowRight') { STATE.panX -= step; applyTransform(g); }
    if (e.key === 'ArrowUp')    { STATE.panY += step; applyTransform(g); }
    if (e.key === 'ArrowDown')  { STATE.panY -= step; applyTransform(g); }
    if (e.key === '+' || e.key === '=') { STATE.zoom = Math.min(STATE.zoom * 1.2, 8); applyTransform(g); }
    if (e.key === '-') { STATE.zoom = Math.max(STATE.zoom * 0.83, 0.55); applyTransform(g); }
  });
}

function setupZoomButtons() {
  const getG = () => document.querySelector('#mapa-g');
  document.getElementById('z-in').onclick  = () => { STATE.zoom = Math.min(STATE.zoom * 1.25, 8); applyTransform(getG()); };
  document.getElementById('z-out').onclick = () => { STATE.zoom = Math.max(STATE.zoom * 0.8, 0.55); applyTransform(getG()); };
  document.getElementById('z-rst').onclick = () => { STATE.zoom = 1; STATE.panX = 0; STATE.panY = 0; applyTransform(getG()); };
}

/* ============================================================
   10. TOOLTIP DE BARRIO
   ============================================================ */
const barrioTooltip = document.getElementById('barrio-tooltip');

function showBarrioTooltip(e, nombreBarrio, comunaId) {
  const comuna = COMUNAS[comunaId];
  if (!comuna) return;
  barrioTooltip.innerHTML = `<span style="color:${comuna.color}">${comuna.nombre}</span> · ${nombreBarrio}`;
  moveBarrioTooltip(e);
  barrioTooltip.classList.add('visible');
}
function moveBarrioTooltip(e) {
  const wrap = document.querySelector('.map-wrap').getBoundingClientRect();
  barrioTooltip.style.left = (e.clientX - wrap.left + 14) + 'px';
  barrioTooltip.style.top  = (e.clientY - wrap.top  - 36) + 'px';
}
function hideBarrioTooltip() { barrioTooltip.classList.remove('visible'); }

/* ============================================================
   11. PANEL DE DETALLE
   ============================================================ */
function selectPlace(id) {
  STATE.selectedId = id;
  document.querySelectorAll('.marker-g').forEach(m => {
    m.style.opacity = (+m.dataset.id === id) ? '1' : '0.35';
  });
  showPanel(LUGARES.find(l => l.id === id));
}

function showPanel(lugar) {
  if (!lugar) return;
  const cfg   = catOf(lugar.categoria);
  const isFav = STATE.favoritos.has(lugar.id);

  // Hero
  const hero = document.getElementById('panel-hero');
  hero.style.background    = `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}0a)`;
  hero.style.borderBottom  = `1px solid ${cfg.color}33`;
  document.getElementById('panel-icon').textContent        = cfg.icon;
  document.getElementById('panel-barrio-label').textContent = lugar.barrio;
  document.getElementById('panel-barrio-label').style.color = cfg.color;

  // Datos
  document.getElementById('panel-cat').textContent       = lugar.categoria;
  document.getElementById('panel-cat').style.color       = cfg.color;
  document.getElementById('panel-name').textContent      = lugar.nombre;
  document.getElementById('panel-addr-text').textContent = lugar.ubicacion_exacta;
  document.getElementById('panel-desc').textContent      = lugar.informacion;
  document.getElementById('panel-horario').textContent   = lugar.horarios_nocturnos;
  document.getElementById('panel-precio').textContent    = lugar.precio;
  document.getElementById('panel-acc').textContent       = lugar.accesibilidad;

  document.getElementById('panel-recs').innerHTML =
    lugar.recomendaciones.map(r => `<li>${r}</li>`).join('');

  document.getElementById('panel-tags').innerHTML =
    lugar.ideal_para.map(t =>
      `<li style="background:${cfg.color}18;border-color:${cfg.color}44;color:${cfg.color}">${t}</li>`
    ).join('');

  updateFavBtn(lugar.id, cfg.color);
  document.getElementById('btn-fav').onclick = () => toggleFav(lugar.id, cfg.color);

  document.getElementById('panel-empty').style.display   = 'none';
  document.getElementById('panel-content').style.display = 'flex';
  document.getElementById('detail-panel').classList.add('open');
}

function updateFavBtn(id, color) {
  const isFav = STATE.favoritos.has(id);
  const btn   = document.getElementById('btn-fav');
  btn.className = 'btn-fav' + (isFav ? ' is-fav' : '');
  document.getElementById('btn-fav-icon').textContent  = isFav ? '❤️' : '🤍';
  document.getElementById('btn-fav-label').textContent = isFav ? 'En favoritos' : 'Agregar a favoritos';
  btn.setAttribute('aria-pressed', isFav);
}

function toggleFav(id, color) {
  if (STATE.favoritos.has(id)) STATE.favoritos.delete(id);
  else STATE.favoritos.add(id);
  saveFavoritos();
  updateFavBtn(id, color);
  buildMap();
  selectPlace(id);
}

function closePanel() {
  STATE.selectedId = null;
  document.getElementById('detail-panel').classList.remove('open');
  document.querySelectorAll('.marker-g').forEach(m => m.style.opacity = '1');
}

document.getElementById('panel-close').addEventListener('click', closePanel);

/* ============================================================
   12. INIT
   ============================================================ */
function init() {
  buildFilters();
  buildLegend();
  buildMap();
  updateCount();
  setupZoomButtons();
  setupSearch();
  document.getElementById('map-loading').classList.add('hidden');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}