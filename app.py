from flask import Flask, request, jsonify, render_template
from biseccion import metodoDeBiseccion 
from puntoFijo import metodoDePuntoFijo
from newton_raphson import metodoDeNewtonRaphson

# Inicializamos el servidor
app = Flask(__name__)

# Ruta de prueba para saber si el servidor está encendido
@app.route('/')
def inicio():
    return render_template('index.html')

# Ruta principal de nuestra API para Bisección
@app.route('/api/biseccion', methods=['POST'])
def api_biseccion():
    # 1. Recibimos el JSON de la página web
    datos = request.json
    
    # 2. Extraemos y convertimos los valores a su tipo correcto
    funcion_usuario = datos['funcion']
    limite_inferior = float(datos['a'])
    limite_superior = float(datos['b'])
    tolerancia = float(datos['tol'])
    max_iteraciones = int(datos['max_it'])
    
    # 3. Llamamos a tu función matemática
    raiz, historial = metodoDeBiseccion(
        funcion_usuario, 
        limite_inferior, 
        limite_superior, 
        tolerancia, 
        max_iteraciones
    )
    
    # 4. Empaquetamos la respuesta
    respuesta = {
        "raiz": raiz,
        "historial": historial
    }
    
    # jsonify convierte nuestro diccionario de Python a formato JSON para la web
    return jsonify(respuesta)

# Ruta para el método de Punto Fijo
@app.route('/api/punto_fijo', methods=['POST'])
def api_punto_fijo():
    # 1. Recibimos el JSON
    datos = request.json
    
    # 2. Extraemos los valores (nota que aquí pedimos 'x0' en lugar de 'a' y 'b')
    funcion_usuario = datos['funcion']
    punto_inicial = float(datos['x0'])
    tolerancia = float(datos['tol'])
    max_iteraciones = int(datos['max_it'])
    
    # 3. Llamamos a tu función matemática
    punto, historial = metodoDePuntoFijo(
        funcion_usuario, 
        punto_inicial, 
        tolerancia, 
        max_iteraciones
    )
    
    # 4. Empaquetamos y enviamos la respuesta
    respuesta = {
        "raiz": punto,
        "historial": historial
    }
    
    return jsonify(respuesta)

    # Ruta para el método de Newton-Raphson
@app.route('/api/newton_raphson', methods=['POST'])
def api_newton_raphson():
    datos = request.json

    funcion_usuario = datos['funcion']
    punto_inicial = float(datos['x0'])
    tolerancia = float(datos['tol'])
    max_iteraciones = int(datos['max_it'])

    raiz, historial = metodoDeNewtonRaphson(
        funcion_usuario, 
        punto_inicial, 
        tolerancia, 
        max_iteraciones
    )

    respuesta = {
        "raiz": raiz,
        "historial": historial
    }

    return jsonify(respuesta)

@app.route('/ejercicios')
def ejercicios():
    # Obtenemos qué método quiere ver el usuario de la URL (ej. ?metodo=secante)
    metodo_seleccionado = request.args.get('metodo', 'punto_fijo') # Por defecto muestra Punto Fijo
    
    # Renderizamos la nueva plantilla pasándole el método
    return render_template('ejercicios.html', metodo=metodo_seleccionado)

# Enciende el servidor
if __name__ == '__main__':
    app.run(debug=True)