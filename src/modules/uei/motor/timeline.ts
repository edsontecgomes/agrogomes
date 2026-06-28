import { EventoMotor } from "./pipeline";

export class TimelineUEI {

  eventos: EventoMotor[] = [];

  adicionar(evento: EventoMotor){

    this.eventos.push(evento);

  }

}