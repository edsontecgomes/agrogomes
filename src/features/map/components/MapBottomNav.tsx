import "./MapBottomNav.css";
import {
    Map,
    Search,
    BrainCircuit,
    History,
    Tractor
} from "lucide-react";

type Props={
    active:string;
    onChange:(tab:string)=>void;
}

export default function MapBottomNav({
    active,
    onChange
}:Props){

    const buttons=[
        {id:"mapa",icon:Map},
        {id:"investigar",icon:Search},
        {id:"ia",icon:BrainCircuit},
        {id:"timeline",icon:History},
        {id:"operacoes",icon:Tractor},
    ];

    return(

        <div className="bottom-nav">

            {buttons.map(btn=>{

                const Icon=btn.icon;

                return(

                    <button
                        key={btn.id}
                        className={
                            active===btn.id
                            ? "active"
                            : ""
                        }
                        onClick={()=>onChange(btn.id)}
                    >

                        <Icon size={22}/>

                    </button>

                );

            })}

        </div>

    );

}