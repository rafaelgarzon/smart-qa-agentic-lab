# /triage ciego · 3 corridas (Qwen3.6 35B A3B en LM Studio, 2026-10-24)

## Corrida 1

| Fallo | Categoría | Confianza | Tiempo (s) |
| :--- | :--- | :--- | :--- |
| FAULT-04 | `DEFECTO_TEST` | ALTA | 120 |
| FAULT-05 | `DATOS_O_ENTORNO` | ALTA | 92 |
| FAULT-06 | `DEFECTO_TEST` | ALTA | 104 |
| FAULT-07 | `DATOS_O_ENTORNO` | ALTA | 48 |
| FAULT-08 | `SELECTOR_DESFASADO` | ALTA | 116 |
| FAULT-09 | `SELECTOR_DESFASADO` | ALTA | 86 |

Total 566 s, promedio 94 s. triage.md con reglas de decisión (commit 552c657) y la spec 001 fija en el contexto.

### Comparación con la clave y la línea base manual

| Fallo | Clave | Manual | Agente | ¿Acierta manual? | ¿Acierta agente? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| FAULT-04 | `BUG_PRODUCTO` | `BUG_PRODUCTO` | `DEFECTO_TEST` | ✅ | ❌ |
| FAULT-05 | `SELECTOR_DESFASADO` | `SELECTOR_DESFASADO` | `DATOS_O_ENTORNO` | ✅ | ❌ |
| FAULT-06 | `DEFECTO_TEST` | `BUG_PRODUCTO` | `DEFECTO_TEST` | ❌ | ✅ |
| FAULT-07 | `DATOS_O_ENTORNO` | `DATOS_O_ENTORNO` | `DATOS_O_ENTORNO` | ✅ | ✅ |
| FAULT-08 | `BUG_PRODUCTO` | `BUG_PRODUCTO` | `SELECTOR_DESFASADO` | ✅ | ❌ |
| FAULT-09 | `DEFECTO_TEST` | `SELECTOR_DESFASADO` | `SELECTOR_DESFASADO` | ❌ | ❌ |

- **Precisión:** manual **4/6** (67 %) · agente **2/6** (33 %).
- **Tiempo medio por fallo:** manual 97 s · agente 94 s.

### Evidencia de cada error (inferencia)

> Inferencia a partir de la salida de cada fallo; ni la línea base manual ni la corrida del agente registran el razonamiento.

**FAULT-04, agente (`DEFECTO_TEST`)**
- Lo que engaña: una diferencia de un centavo (`32.4` contra `32.39`) dentro de un cálculo con `Math.round` en el POM parece un problema de coma flotante del test.
- Lo que lo descartaba: la suma de los dos montos que muestra la UI no da el total que muestra la UI. El agente tenía fija la spec 001 en el contexto, no la 002, que es donde la RF-4 exige la igualdad exacta.

**FAULT-05, agente (`DATOS_O_ENTORNO`)**
- Lo que engaña: el error es `Test timeout of 30000ms exceeded`, el timeout global del test y no un "not found" rápido, y eso parece un entorno lento o colgado.
- Lo que lo descartaba: los pasos previos en la misma vista del carrito pasaron rápido, y el registro de la llamada muestra que el localizador nunca resolvió ningún elemento. Eso apunta al DOM, no a la red.

**FAULT-06, manual (`BUG_PRODUCTO`, confianza media)**
- Lo que engaña: `Expected: []` contra `Received: ["backtrace-guid", "backtrace-last-active"]` se lee como "el logout deja datos y no limpia la sesión".
- Lo que lo descartaba: la aserción anterior, que la cookie de sesión esté ausente, pasa. Y la RF-9 de la spec 006 acepta de forma explícita que esas dos claves persistan. El propio título dice "elimina **únicamente** la credencial", lo opuesto a lo que asevera el test.

**FAULT-08, agente (`SELECTOR_DESFASADO`)**
- Lo que engaña: un timeout de 5 s dentro de una espera del POM, con un localizador encadenado (`.first().locator(...)`) que aparece en `waiting for locator(...)`.
- Lo que lo descartaba: el localizador sí resolvió y devolvió un valor estable (`Received: "Sauce Labs Onesie"`). Un selector obsoleto no devuelve texto. Onesie es el más barato, o sea que el orden está invertido. El triage manual no cayó en este señuelo.

**FAULT-09, manual y agente (`SELECTOR_DESFASADO`)**
- Lo que engaña: era el señuelo previsto. `element(s) not found` y `waiting for locator('[data-test="shopping-cart-badge"]')` tienen la forma clásica de un localizador obsoleto.
- Lo que lo descartaba: el mismo localizador resolvió con `"1"` dos líneas antes en la misma vista. Además, la RF-4 de la spec 004 dice que con el carrito vacío el badge no se renderiza, así que el test pide algo que la spec prohíbe. Ambos lo marcaron con confianza alta, así que fue el señuelo más eficaz.

### Patrones

> La evidencia de cada error es una **inferencia** hecha a partir de la salida de cada fallo. Ni la línea base manual ni la corrida del agente registran el razonamiento, solo la categoría.

- **El agente está mal calibrado:** marcó los 6 fallos con confianza ALTA, incluidos los 4 que falló. El triage manual usó confianza media en el error de FAULT-06 y en el acierto difícil de FAULT-08.
- **El agente no comprueba si el localizador ya funcionó antes:** dos de sus errores (FAULT-08 y FAULT-09) caen en `SELECTOR_DESFASADO` sin verificar si ese mismo localizador resolvió antes o devolvió un valor. Una regla de decisión del tipo "si el localizador resolvió en algún punto o hay `Received: <valor>`, no es selector" habría evitado ambos.
- **Puede pesar que la spec 001 esté fija en el contexto**, porque los fallos de este lote vienen de otras specs. Pero no lo explica todo: el agente acertó FAULT-06 sin tener la spec 006.
- **Tiempo:** el agente fue apenas más rápido (94 s de media contra 97 s), así que la diferencia está en la precisión, no en el tiempo.

Estos patrones salen de la corrida 1; las corridas 2 y 3 los matizan (sección siguiente).

## Corridas 2 y 3

| Fallo | Corrida 2 | Conf. | Tiempo (s) | Corrida 3 | Conf. | Tiempo (s) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FAULT-04 | `DEFECTO_TEST` ❌ | ALTA | 107 | `BUG_PRODUCTO` ✅ | ALTA | 136 |
| FAULT-05 | `SELECTOR_DESFASADO` ✅ | ALTA | 74 | `INDETERMINADO` ❌ | MEDIA | 55 |
| FAULT-06 | `DEFECTO_TEST` ✅ | ALTA | 71 | `DEFECTO_TEST` ✅ | ALTA | 92 |
| FAULT-07 | `DATOS_O_ENTORNO` ✅ | ALTA | 61 | `DATOS_O_ENTORNO` ✅ | ALTA | 40 |
| FAULT-08 | `SELECTOR_DESFASADO` ❌ | ALTA | 74 | sin diagnóstico ❌ | — | 62 |
| FAULT-09 | `SELECTOR_DESFASADO` ❌ | ALTA | 92 | `DEFECTO_TEST` ✅ | ALTA | 74 |

En la corrida 3, FAULT-08 terminó sin diagnóstico: el modelo dijo "Necesito leer más contexto" y terminó sin llamar herramientas.

- **Aciertos por corrida:** 2/6 · 3/6 · 4/6.
- **Total:** 9/18 (50 %).
- **Voto mayoritario:** 2/6 (FAULT-05 no tiene mayoría).
- **Tiempo medio de las 18 corridas:** 84 s, contra 97 s del triage manual.

### Hallazgos
- El mismo fallo recibe categorías distintas en 4 de 6 casos.
- La confianza declarada casi siempre es ALTA y no informa.
- La concordancia entre las 3 corridas fue correcta en los 2 casos unánimes.
- 1 de 18 corridas terminó sin diagnóstico.

Los logs completos están fuera del repo, en `~/triage-runs/`.
