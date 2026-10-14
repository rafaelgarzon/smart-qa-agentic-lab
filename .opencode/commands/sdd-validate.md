---
description: SDD · Valida la spec RF por RF (Quality Gate)
agent: reviewer
---
Recorre specs/$1/spec.md requisito funcional por requisito funcional (RF-x).
1. Indica qué archivo y caso de prueba cubre cada RF.
2. Ejecuta npm run lint:determinism y npm run test:all.
3. Si un RF no está cubierto o falla, repórtalo con claridad. NO modifiques aserciones ni código.
4. Emite el veredicto final: ¿La spec está formalmente CUMPLIDA?
