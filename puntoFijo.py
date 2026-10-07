import sympy as sp

def metodoDePuntoFijo(funcion_usuario,punto_inicial,tolerancia,max_iteraciones):

    x = sp.Symbol('x')
    funcion = sp.sympify(funcion_usuario)
    iteracion = 1
    historial_pasos = []
    error = 100
    x_anterior = punto_inicial

    while iteracion <= max_iteraciones:
        x_nuevo = float(funcion.subs(x, x_anterior).evalf())
        if x_nuevo != 0:
            error = abs((x_nuevo - x_anterior) / x_nuevo) * 100 
        else:
            error = 100

        #Guardar los resultados de la iteración actual en un diccionario
        fila_actual={
            "Iteración": iteracion ,
            "Punto Anterior": x_anterior,
            "Punto Nuevo": x_nuevo,
            "Error (%)": error
        }

        historial_pasos.append(fila_actual)

        #Revisa si el error es menor a la tolerancia para detener el proceso
        if error < tolerancia:
            return x_nuevo, historial_pasos

        #Actualizar el punto anterior para la siguiente iteración
        x_anterior = x_nuevo
        iteracion += 1

    return x_nuevo, historial_pasos


# SECCIÓN DE PRUEBAS

if __name__ == "__main__":
    # Para el método de Punto Fijo, usamos g(x)
    # Ejemplo: Para f(x) = e^-x - x, su despeje es g(x) = e^-x
    ecuacion = "exp(-x)"  
    x0 = 0.0
    tol = 0.001
    max_it = 50

    punto, pasos = metodoDePuntoFijo(ecuacion, x0, tol, max_it)

    print(f"¡Éxito! El punto fijo calculado es: {punto}\n")
    print("Historial de iteraciones:")
    for paso in pasos:
        print(paso)