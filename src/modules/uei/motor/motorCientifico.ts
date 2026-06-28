import { EventoMotor } from "./pipeline";
import { TimelineUEI } from "./timeline";

export class MotorCientifico{

    timeline=new TimelineUEI();

    processar(evento:EventoMotor){

        this.timeline.adicionar(evento);

        // Aqui futuramente:
        // recalcular indicadores
        // recalcular estatísticas
        // recalcular correlações
        // gerar recomendações
        // alimentar IA

    }

}