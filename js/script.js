const MODEL = "gemini-2.0-flash";
const API_KEY = "AIzaSyCoMsf2HZQKCV5EZTTPhfP99eUGvW3wnQI";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

async function respuestaAPI(){
    const temas = [
        "tipos de granos y su tostado",
        "degustación y cata de café",
        "temperatura y tiempo de extracción",
        "uso de métodos para preparar café",
        "proporciones de café y agua"
    ];

    const temaAleatorio = temas[Math.floor(Math.random() * temas.length)];

const prompt = `
    Genera una pregunta de opción múltiple sobre fútbol que SEA FÁCIL, 
    pero NO uses temas repetidos, famosos o institucionales.
    
    PROHIBIDO generar preguntas sobre:
    - Maradona
    - Messi
    - Cristiano Ronaldo
    - Pelé
    - Futbolistas famosos en general
    - Dorsales clásicos como el 7 o el 10
    - FIFA, UEFA, organismos o reglas institucionales
    - Copas del Mundo o historia de mundiales
    - Balones de Oro o premios

    PERMITIDO:
    - Conceptos simples del juego
    - Posiciones
    - Partes del campo
    - Acciones básicas (pase, tiro, saque lateral, tiro libre, córner, fuera de lugar)
    - Roles dentro del equipo
    - Situaciones comunes en un partido
    - Equipos anónimos (no mencionar clubes reales)

    La pregunta debe ser fácil y distinta cada vez.

    ENTREGA EXCLUSIVAMENTE un JSON con:
    "question", "options", "correct_answer", "explanation"

    Cuatro opciones tipo a), b), c), d).

    Ejemplo DEL TIPO DE PREGUNTA que sí se permite (NO repetir):
    {
        "question": "¿Qué sucede cuando el balón sale completamente por la línea de banda?",
        "options": ["a) Tiro libre", "b) Saque de meta", "c) Saque de banda", "d) Córner"],
        "correct_answer": "c) Saque de banda",
        "explanation": "Cuando el balón cruza la línea lateral, el juego se reanuda con un saque de banda."
    }
`;



    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.25,
                    responseMimeType: "application/json"
                }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error HTTP ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        const limpio = textResult.trim();
        const inicio = limpio.indexOf('{');
        const fin = limpio.lastIndexOf('}');
        const jsonString = limpio.substring(inicio, fin + 1);

        if (jsonString) {
            return JSON.parse(jsonString);
        }
        
    } catch (error) {
        console.error("Error en la petición:", error);
        document.getElementById('question').textContent =
            'No se pudo cargar la pregunta. Revisa la API KEY o la consola.';
        return null;
    }
}

async function cargarPregunta() {
    document.getElementById('question').className = 'text-warning';
    document.getElementById('question').textContent = 'Cargando pregunta...';
    document.getElementById('options').innerHTML = '';

    const datosPregunta = await respuestaAPI();

    if (datosPregunta) {
        document.getElementById('question').className = 'text-success';
        desplegarPregunta(datosPregunta);
    }
}

function desplegarPregunta(datos){
    const textoPregunta = document.getElementById("question");
    const contOpciones = document.getElementById("options");

    textoPregunta.textContent = datos.question;
    contOpciones.innerHTML = "";

    const lista = document.createElement("ul");
    lista.classList.add("list-unstyled");

    datos.options.forEach((opcion, idx) => {
        const item = document.createElement("li");
        const boton = document.createElement("button");

        boton.className = "btn btn-light";
        boton.textContent = opcion;

        boton.onclick = () => {
            const esCorrecta = opcion === datos.correct_answer;

            boton.classList.replace(
                "btn-light",
                esCorrecta ? "btn-success" : "btn-danger"
            );

            guardarPuntaje(esCorrecta ? 1 : 0, esCorrecta ? 0 : 1);
        };

        item.appendChild(boton);
        lista.appendChild(item);
    });

    contOpciones.appendChild(lista);
}

function guardarPuntaje(bien, mal){
    const guardado = localStorage.getItem("score");
    let puntaje = guardado ? JSON.parse(guardado) : {Correctas: 0, Incorrectas: 0};

    puntaje.Correctas += bien;
    puntaje.Incorrectas += mal;

    localStorage.setItem("score", JSON.stringify(puntaje));

    setTimeout(() => location.reload(), 1800);
}

function desplegarPuntajes(){
    const datos = JSON.parse(localStorage.getItem("score")) || {Correctas: 0, Incorrectas: 0};

    document.getElementById("correctas").textContent = datos.Correctas;
    document.getElementById("incorrectas").textContent = datos.Incorrectas;
}

window.onload = () => {
    console.log("Página inicializada.");
    desplegarPuntajes();
    cargarPregunta();
};
