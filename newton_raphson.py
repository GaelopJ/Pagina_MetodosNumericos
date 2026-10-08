import sympy as sp

def metodoDeNewtonRaphson(ecuacion, x0, tol, max_it):
    x = sp.symbols('x')
    funcion = sp.sympify(ecuacion)
    
    # ¡LA MAGIA DE SYMPY! Calculamos la derivada automáticamente
    derivada = sp.diff(funcion, x)
    
    historial = []
    error = 100.0
    iteracion = 1
    
    # Evaluamos f(x0) y f'(x0) iniciales
    f_x0 = float(funcion.subs(x, x0).evalf())
    df_x0 = float(derivada.subs(x, x0).evalf())
    
    while iteracion <= max_it:
        # Si la derivada es 0, la recta tangente es horizontal y no cruza el eje X
        if df_x0 == 0:
            return "Error: División entre cero (Derivada = 0)", historial
            
        # Fórmula de Newton-Raphson: x_nuevo = x_viejo - (f(x_viejo) / f'(x_viejo))
        x_nuevo = x0 - (f_x0 / df_x0)
        
        # Calculamos el error
        if x_nuevo != 0:
            error = abs((x_nuevo - x0) / x_nuevo) * 100
            
        # Evaluamos el nuevo punto para la siguiente vuelta
        f_x_nuevo = float(funcion.subs(x, x_nuevo).evalf())
        df_x_nuevo = float(derivada.subs(x, x_nuevo).evalf())
        
        # Guardamos el paso en el historial
        fila_actual = {
            "Iteración": iteracion,
            "x(i)": x0,
            "x(i+1)": x_nuevo,
            "f(x)": f_x0,
            "f'(x)": df_x0,
            "Error (%)": error
        }
        historial.append(fila_actual)
        
        # Condición de paro
        if error < tol:
            return x_nuevo, historial
            
        # Preparamos la siguiente iteración
        x0 = x_nuevo
        f_x0 = f_x_nuevo
        df_x0 = df_x_nuevo
        iteracion += 1
        
    return x0, historial