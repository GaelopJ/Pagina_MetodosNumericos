import sympy as sp

def metodoDeBiseccion(funcion_usuario,limite_inferior,limite_superior,tolerancia,max_iteraciones):

    x = sp.Symbol('x')
    funcion = sp.sympify(funcion_usuario)
    funcion_evaluada_inferior = funcion.subs(x, limite_inferior).evalf()
    funcion_evaluada_superior = funcion.subs(x, limite_superior).evalf()

    if funcion_evaluada_inferior * funcion_evaluada_superior > 0:
        return None ,"No se puede aplicar el método de bisección. La función no cambia de signo en el intervalo dado."
    
    elif funcion_evaluada_inferior * funcion_evaluada_superior == 0:
        if funcion_evaluada_inferior == 0:
            return limite_inferior , []
        else:
            return limite_superior, []
        
    else:
        iteracion = 1
        historial_pasos = []
        error = 100
        c_anterior = 0

        while iteracion <= max_iteraciones:
            c = (limite_inferior + limite_superior) / 2
            funcion_evaluada_c = funcion.subs(x, c).evalf()
            if iteracion > 1:
                if c != 0:
                    error = abs((c - c_anterior) / c) * 100 
                else:
                    error = 100
            

            #Guardar los resultados de la iteración actual en un diccionario

            fila_actual={
            "Iteración": iteracion ,
            "Limite Inferior": limite_inferior,
            "Limite Superior": limite_superior,
            "Punto Medio (c)": c,
            "f(c)": funcion_evaluada_c,
            "Error (%)": error
            }

            historial_pasos.append(fila_actual)

            #Revisa si el error es menor a la tolerancia para detener el proceso

            if iteracion > 1 and error < tolerancia:
                return c, historial_pasos

            #Actualizar los límites del intervalo
            if funcion_evaluada_inferior * funcion_evaluada_c < 0:
                funcion_evaluada_superior = funcion_evaluada_c
                limite_superior = c
            elif funcion_evaluada_inferior * funcion_evaluada_c > 0:
                funcion_evaluada_inferior = funcion_evaluada_c
                limite_inferior = c
            else :
                return c, historial_pasos

            #Incrementar el contador de iteraciones y actualizar c_anterior
            iteracion += 1
            c_anterior = c

    return c, historial_pasos

#SECCIÓN DE PRUEBAS

if __name__ == "__main__":

    # Todo esto lleva un Tab (indentación) hacia la derecha
    ecuacion = "x**3 - x - 2"  
    a = 1.0
    b = 2.0
    tol = 0.001
    max_it = 50

    resultado = metodoDeBiseccion(ecuacion, a, b, tol, max_it)

    if type(resultado) == str:
        print(resultado)
    else:
        raiz, pasos = resultado
        print(f"¡Éxito! La raíz calculada es: {raiz}\n")
        
        print("Historial de iteraciones:")
        for paso in pasos:
            print(paso)