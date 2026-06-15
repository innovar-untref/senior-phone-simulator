import streamlit as st
import random

# --- Configuración de la Página ---
st.set_page_config(page_title="Pronto Prompt - Entrenamiento Cognitivo", layout="centered", initial_sidebar_state="expanded")

# --- CSS Personalizado (Alto Contraste y Botones Grandes) ---
st.markdown("""
    <style>
    .stButton>button {
        width: 100%;
        height: 80px;
        font-size: 24px;
        font-weight: bold;
        background-color: #0056b3;
        color: white;
        border-radius: 12px;
        margin-bottom: 10px;
    }
    .stButton>button:hover {
        background-color: #004494;
        color: white;
    }
    h1 {
        font-size: 40px;
        color: #333333;
    }
    h2 {
        font-size: 32px;
        color: #444444;
    }
    p, .stMarkdown {
        font-size: 22px;
        color: #000000;
    }
    /* Estilo especial para el botón de Auxilio */
    div[data-testid="stSidebar"] .stButton>button:last-child {
        background-color: #d9534f;
        height: 100px;
        font-size: 28px;
        margin-top: 20px;
    }
    div[data-testid="stSidebar"] .stButton>button:last-child:hover {
        background-color: #c9302c;
    }
    </style>
""", unsafe_allow_html=True)

# --- Inicialización del Estado ---
if 'page' not in st.session_state:
    st.session_state.page = 'inicio'
if 'difficulty' not in st.session_state:
    st.session_state.difficulty = 3 # Longitud inicial de la secuencia a recordar
if 'sequence' not in st.session_state:
    st.session_state.sequence = []
if 'user_input' not in st.session_state:
    st.session_state.user_input = []
if 'game_state' not in st.session_state:
    st.session_state.game_state = 'show_sequence'

# --- Funciones de Navegación y Lógica (Machine Learning Simple) ---
def go_to(page_name):
    st.session_state.page = page_name

def restart_game():
    # Genera una nueva secuencia basada en la dificultad actual
    st.session_state.sequence = [random.randint(0, 9) for _ in range(st.session_state.difficulty)]
    st.session_state.user_input = []
    st.session_state.game_state = 'show_sequence'

def decrease_difficulty():
    """ML Simple: Reduce la dificultad (ej. al pedir auxilio o fallar)"""
    if st.session_state.difficulty > 2:
        st.session_state.difficulty -= 1

def increase_difficulty():
    """ML Simple: Aumenta la dificultad si el usuario acierta"""
    if st.session_state.difficulty < 10:
        st.session_state.difficulty += 1

# --- Barra Lateral (Sidebar) ---
with st.sidebar:
    st.markdown("## Opciones Principales")
    if st.button("🏠 Volver al Inicio"):
         go_to('inicio')
    
    st.markdown("---")
    st.markdown("### Innovar UNTREF")
    # Enlace a cursos (sustituir URL por la real de los cursos)
    st.markdown("[🔗 Acceder a Cursos de Innovar UNTREF](https://untref.edu.ar/)") 
    
    st.markdown("---")
    # Botón de Auxilio Permanente
    if st.button("🚨 AUXILIO"):
         go_to('auxilio')
         decrease_difficulty() # Regla adaptativa: Si pide ayuda, reducimos la dificultad

# --- Renderizado de Páginas ---

if st.session_state.page == 'inicio':
    st.title("Bienvenido a Pronto Prompt")
    st.markdown("Estamos aquí para ejercitar nuestra mente de forma sencilla y entretenida.")
    st.markdown("¿Qué desea hacer hoy?")
    
    if st.button("🧠 Jugar a la Memoria"):
        go_to('juego_memoria')
        restart_game()
        st.rerun()

elif st.session_state.page == 'auxilio':
    st.title("Sección de Ayuda (Auxilio)")
    st.markdown("No se preocupe, estamos aquí para ayudarle paso a paso.")
    st.markdown("""
    **Guía rápida de uso:**
    - Para comenzar a jugar, presione el botón **"Volver al Inicio"** en el menú izquierdo y luego elija **"Jugar a la Memoria"**.
    - El juego le mostrará unos números en pantalla. Mírelos con atención.
    - Cuando esté listo, presione el botón y tendrá que escribir esos números en el mismo orden.
    - ¡No tenga miedo de equivocarse! Si falla, el juego se hará más fácil automáticamente para adaptarse a usted.
    - Como ha solicitado ayuda, hemos hecho el próximo juego un poco más sencillo.
    """)
    if st.button("Entendido, Volver al Inicio"):
        go_to('inicio')
        st.rerun()

elif st.session_state.page == 'juego_memoria':
    st.title("Juego de Memoria")
    
    if st.session_state.game_state == 'show_sequence':
        st.markdown(f"**Nivel de dificultad:** {st.session_state.difficulty} números.")
        st.markdown("Por favor, mire estos números y trate de recordarlos:")
        
        # Mostrar la secuencia con formato grande
        seq_str = " - ".join(map(str, st.session_state.sequence))
        st.markdown(f"<h2 style='text-align: center; color: #0056b3; background-color: #e6f2ff; padding: 20px; border-radius: 10px;'>{seq_str}</h2>", unsafe_allow_html=True)
        
        st.markdown("Tómese todo el tiempo que necesite.")
        if st.button("✅ ¡Ya los memoricé!"):
            st.session_state.game_state = 'input_sequence'
            st.rerun()
            
    elif st.session_state.game_state == 'input_sequence':
        st.markdown("¿Qué números recuerda? Presiónelos en orden:")
        
        # Teclado Numérico Grande
        cols = st.columns(3)
        for i in range(1, 10):
            with cols[(i-1)%3]:
                if st.button(str(i), key=f"btn_{i}"):
                    st.session_state.user_input.append(i)
        with cols[1]:
            if st.button("0", key="btn_0"):
                st.session_state.user_input.append(0)
                
        st.markdown("---")
        # Mostrar lo que el usuario va ingresando
        st.markdown(f"**Usted escribió:** {' - '.join(map(str, st.session_state.user_input))}")
        
        if st.button("Borrar último número"):
            if st.session_state.user_input:
                st.session_state.user_input.pop()
                st.rerun()
        
        # Validar cuando ingresa todos los números
        if len(st.session_state.user_input) >= len(st.session_state.sequence):
            if st.session_state.user_input == st.session_state.sequence:
                st.session_state.game_state = 'win'
                increase_difficulty() # Lógica adaptativa: Sube dificultad por acierto
            else:
                st.session_state.game_state = 'lose'
                decrease_difficulty() # Lógica adaptativa: Baja dificultad por fallo
            st.rerun()

    elif st.session_state.game_state == 'win':
        st.success("¡Excelente trabajo! Ha recordado todos los números correctamente. 🎉")
        st.markdown("Para el próximo juego, aumentaremos un poquito el desafío. ¡Usted puede!")
        if st.button("Jugar de nuevo"):
            restart_game()
            st.rerun()
            
    elif st.session_state.game_state == 'lose':
        st.error("No pasa nada, ha sido un buen intento.")
        st.markdown(f"Los números correctos eran: **{' - '.join(map(str, st.session_state.sequence))}**")
        st.markdown("Hemos ajustado la dificultad para que sea más cómodo. ¡Lo hará genial en la próxima!")
        if st.button("Intentar otra vez"):
            restart_game()
            st.rerun()
