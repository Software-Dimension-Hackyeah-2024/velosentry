import { ZdarzeniaResponse } from './obserwatoriumbrd-schema';
import { Accident, AccidentSeverity } from './types';

export function transformAccidents(apiResponse: ZdarzeniaResponse): Accident[]{
  return apiResponse.mapa.wojewodztwa
    .flatMap(wojewodztwo =>
      wojewodztwo.powiaty.flatMap(powiat =>
        powiat.gminy.flatMap(gmina => gmina.zdarzenia_detale.map((item)=>({
        id: item.id,
        lat: item.wsp_gps_y,
        long: item.wsp_gps_x,
        severity:translateSeverity(item.ciezkosc)
  }))
      )
    ) 
)
}

function translateSeverity(zdarzenie: "L"| "C"|"S"):AccidentSeverity{
  switch (zdarzenie){
    case "L": return "MINOR";
    case "C": return "SERIOUS";
    case "S": return "FATAL";
  }
}